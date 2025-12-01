import { useEffect, useState } from 'react';
import { Patient, Exam, CartItem, Invoice, BillingState } from './types';

import { PatientList } from './components/PatientList';
import { ExamList } from './components/ExamList';
import { BillingCart } from './components/BillingCart';
import { InvoiceHistory } from './components/InvoiceHistory';
import { generateInvoicePDF } from './utils/pdfGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';

// 👇 Usa aquí el mismo puerto que Swagger (https://localhost:XXXX/swagger)
const API_BASE_URL = 'https://localhost:7087';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [billingState, setBillingState] = useState<BillingState>({
    selectedPatient: null,
    cart: [],
    discount: 0,
    invoices: []
  });
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState('patients');

  // ==========================
  //  Carga inicial (pacientes, facturas, exámenes)
  // ==========================
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/patients`);
        if (!res.ok) throw new Error('Error al cargar pacientes');
        const data: Patient[] = await res.json();
        setPatients(data);
      } catch (err) {
        console.error(err);
        toast.error('No se pudieron cargar los pacientes');
      }
    };

    const loadInvoices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/invoices`);
        if (!res.ok) throw new Error('Error al cargar facturas');
        const data: Invoice[] = await res.json();
        setBillingState(prev => ({
          ...prev,
          invoices: data
        }));
      } catch (err) {
        console.error(err);
        toast.error('No se pudo cargar el historial de facturas');
      }
    };

    const loadExams = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/exams`);
        console.log('GET /api/exams status:', res.status);
        if (!res.ok) throw new Error('Error al cargar exámenes');
        const data: Exam[] = await res.json();
        setExams(data);
      } catch (err) {
        console.error(err);
        toast.error('No se pudieron cargar los exámenes');
      }
    };

    loadPatients();
    loadInvoices();
    loadExams();
  }, []);

  // ==========================
  //  Gestión de Pacientes
  // ==========================
  const handleAddPatient = async (patientData: Omit<Patient, 'id'>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });

      console.log('POST /api/patients status:', res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error('Error body:', text);
        throw new Error('Error al crear paciente');
      }

      const created: Patient = await res.json();
      console.log('Creado desde backend:', created);

      setPatients(prev => [created, ...prev]);

      toast.success(
        `Paciente ${patientData.firstName} ${patientData.lastName} añadido exitosamente`
      );
    } catch (err) {
      console.error(err);
      toast.error('No se pudo guardar el paciente en el servidor');
    }
  };

  const handleImportPatients = async (patientsData: Omit<Patient, 'id'>[]) => {
    try {
      const createdPatients: Patient[] = [];

      for (const p of patientsData) {
        const res = await fetch(`${API_BASE_URL}/api/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        });

        if (!res.ok) throw new Error('Error al importar pacientes');

        const created: Patient = await res.json();
        createdPatients.push(created);
      }

      setPatients(prev => [...createdPatients, ...prev]);
      toast.success(`${createdPatients.length} pacientes importados exitosamente`);
    } catch (err) {
      console.error(err);
      toast.error('Error al importar pacientes');
    }
  };

  // ==========================
  //  Selección de Paciente
  // ==========================
  const handleSelectPatient = (patient: Patient) => {
    setBillingState(prev => ({
      ...prev,
      selectedPatient: patient,
      cart: [],
      discount: 0
    }));
    setActiveTab('billing');
  };

  const handleBackToPatients = () => {
    setBillingState(prev => ({
      ...prev,
      selectedPatient: null,
      cart: [],
      discount: 0
    }));
    setActiveTab('patients');
  };

  // ==========================
  //  Carrito
  // ==========================
  const handleAddToCart = (exam: Exam, price: number) => {
    const existingItem = billingState.cart.find(item => item.exam.id === exam.id);

    if (existingItem) {
      toast.info('Este examen ya está en el carrito');
      return;
    }

    const newCartItem: CartItem = {
      exam,
      quantity: 1,
      price
    };

    setBillingState(prev => ({
      ...prev,
      cart: [...prev.cart, newCartItem]
    }));

    toast.success(`${exam.name} añadido al carrito`);
  };

  const handleRemoveFromCart = (examId: number) => {
    const item = billingState.cart.find(item => item.exam.id === examId);

    setBillingState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.exam.id !== examId)
    }));

    if (item) {
      toast.success(`${item.exam.name} eliminado del carrito`);
    }
  };

  const handleUpdateQuantity = (examId: number, quantity: number) => {
    if (quantity < 1 || quantity > 10) return;

    setBillingState(prev => ({
      ...prev,
      cart: prev.cart.map(item =>
        item.exam.id === examId ? { ...item, quantity } : item
      )
    }));
  };

  const handleUpdateDiscount = (discount: number) => {
    if (discount < 0 || discount > 100) return;
    setBillingState(prev => ({ ...prev, discount }));
  };

  // ==========================
  //  Facturación / PDF
  // ==========================
  const handleGenerateInvoice = async () => {
    if (!billingState.selectedPatient || billingState.cart.length === 0) {
      toast.error('No hay exámenes seleccionados');
      return;
    }

    const patient = billingState.selectedPatient;

    const items = billingState.cart.map(item => ({
      examName: item.exam.name,
      quantity: item.quantity,
      price: item.price
    }));

    const payload = {
      patientId: patient.id,
      items,
      discount: billingState.discount
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('POST /api/invoices status:', res.status);

      if (!res.ok) {
        const msg = await res.text();
        console.error('Error creando factura:', msg);
        toast.error('No se pudo generar la factura');
        return;
      }

      const createdInvoice: Invoice = await res.json();

      // Actualizar historial en memoria
      setBillingState(prev => ({
        ...prev,
        invoices: [createdInvoice, ...prev.invoices],
        cart: [],
        discount: 0
      }));

      // Generar PDF local con la info devuelta
      try {
        generateInvoicePDF(createdInvoice);
      } catch (err) {
        console.error('Error generando PDF', err);
      }

      toast.success('Factura generada exitosamente ⚡');
      setActiveTab('history');
    } catch (err) {
      console.error('Error de conexión al crear factura', err);
      toast.error('Error de conexión con el servidor');
    }
  };

  // Descargar / volver a generar PDF de una factura existente
  const handleDownloadInvoice = (invoice: Invoice) => {
    try {
      generateInvoicePDF(invoice);
      toast.success('Factura exportada como PDF');
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el PDF de la factura');
    }
  };

  // ==========================
  //  Render
  // ==========================
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2">Sistema de Facturación Médica</h1>
          <p className="text-muted-foreground">
            Gestión de pacientes, exámenes médicos y facturación
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="billing" disabled={!billingState.selectedPatient}>
              Facturación
            </TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6">
            <PatientList
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onAddPatient={handleAddPatient}
              onImportPatients={handleImportPatients}
            />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            {billingState.selectedPatient ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ExamList
                    exams={exams}                // 👈 ahora viene del backend
                    onAddToCart={handleAddToCart}
                    cart={billingState.cart}
                  />
                </div>
                <div>
                  <BillingCart
                    patient={billingState.selectedPatient}
                    cart={billingState.cart}
                    discount={billingState.discount}
                    onUpdateDiscount={handleUpdateDiscount}
                    onRemoveFromCart={handleRemoveFromCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onGenerateInvoice={handleGenerateInvoice}
                    onBackToPatients={handleBackToPatients}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Selecciona un paciente en la pestaña de Pacientes para comenzar la
                facturación.
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <InvoiceHistory
              invoices={billingState.invoices}
              onDownloadInvoice={handleDownloadInvoice}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </div>
  );
}

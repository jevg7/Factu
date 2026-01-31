export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'Masculino' | 'Femenino' | 'Otro';
  phone: string;
  email?: string;
  dateOfBirth?: string;
}

export interface Exam {
  id: number;              
  name: string;
  category: string;
  basePrice: number;
  description?: string;
}

export interface CartItem {
  exam: Exam;
  price: number;
  quantity: number;
}
export interface InvoiceItem {
  id: number;
  examId: number;
  exam?: Exam;      // viene en GET /api/invoices/{id}
  quantity: number;
  price: number;
}
export interface Invoice {
   id: number;
  invoiceNumber: string;
  createdAt: string;
  discount: number;
  total: number;
  patient?: { firstName: string; lastName: string };
  items: InvoiceItem[];
}

export interface BillingState {
  selectedPatient: Patient | null;
  cart: CartItem[];
  discount: number;
  invoices: Invoice[];
}
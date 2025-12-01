import { useState } from 'react';
import { Patient } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';

interface ImportPatientsExcelProps {
  onImportPatients: (patients: Omit<Patient, 'id'>[]) => void;
}

interface ImportRow {
  nombres?: string;
  apellidos?: string;
  genero?: string;
  celular?: string;
  email?: string;
  fechaNacimiento?: string;
  isValid: boolean;
  errors: string[];
}

export function ImportPatientsExcel({ onImportPatients }: ImportPatientsExcelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateRow = (row: any): ImportRow => {
    const errors: string[] = [];
    const importRow: ImportRow = {
      nombres: row.nombres || row.Nombres || row.NOMBRES || '',
      apellidos: row.apellidos || row.Apellidos || row.APELLIDOS || '',
      genero: row.genero || row.género || row.Genero || row.Género || row.GENERO || '',
      celular: row.celular || row.Celular || row.CELULAR || row.telefono || row.Telefono || '',
      email: row.email || row.Email || row.EMAIL || '',
      fechaNacimiento: row.fechaNacimiento || row['fecha nacimiento'] || row.FechaNacimiento || '',
      isValid: true,
      errors: []
    };

    // Validate required fields
    if (!importRow.nombres?.trim()) {
      errors.push('Nombres es requerido');
    }

    if (!importRow.apellidos?.trim()) {
      errors.push('Apellidos es requerido');
    }

    if (!importRow.genero?.trim()) {
      errors.push('Género es requerido');
    } else {
      const normalizedGender = importRow.genero.toLowerCase();
      if (!['masculino', 'femenino', 'otro', 'm', 'f', 'male', 'female'].includes(normalizedGender)) {
        errors.push('Género debe ser Masculino, Femenino u Otro');
      }
    }

    if (!importRow.celular?.trim()) {
      errors.push('Celular es requerido');
    } else if (!/^[\+]?[\d\s\-\(\)]+$/.test(importRow.celular.trim())) {
      errors.push('Formato de celular inválido');
    }

    // Validate optional email format
    if (importRow.email && !/\S+@\S+\.\S+/.test(importRow.email)) {
      errors.push('Formato de email inválido');
    }

    importRow.isValid = errors.length === 0;
    importRow.errors = errors;

    return importRow;
  };

  const normalizeGender = (gender: string): Patient['gender'] => {
    const normalized = gender.toLowerCase();
    if (['masculino', 'm', 'male'].includes(normalized)) return 'Masculino';
    if (['femenino', 'f', 'female'].includes(normalized)) return 'Femenino';
    return 'Otro';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const validatedData = jsonData.map(validateRow);
      setImportData(validatedData);
      
      const validCount = validatedData.filter(row => row.isValid).length;
      const totalCount = validatedData.length;
      
      toast.success(`Archivo procesado: ${validCount}/${totalCount} filas válidas`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error al procesar el archivo Excel');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    const validRows = importData.filter(row => row.isValid);
    
    if (validRows.length === 0) {
      toast.error('No hay filas válidas para importar');
      return;
    }

    const patients: Omit<Patient, 'id'>[] = validRows.map(row => ({
      firstName: row.nombres!.trim(),
      lastName: row.apellidos!.trim(),
      gender: normalizeGender(row.genero!),
      phone: row.celular!.trim(),
      email: row.email?.trim() || undefined,
      dateOfBirth: row.fechaNacimiento?.trim() || undefined
    }));

    onImportPatients(patients);
    
    // Reset state
    setFile(null);
    setImportData([]);
    setIsOpen(false);
    
    toast.success(`${patients.length} pacientes importados exitosamente`);
  };

  const downloadTemplate = () => {
    const template = [
      {
        nombres: 'Juan Carlos',
        apellidos: 'Pérez García',
        genero: 'Masculino',
        celular: '+1-555-0123',
        email: 'juan.perez@email.com',
        fechaNacimiento: '1985-03-15'
      },
      {
        nombres: 'María Isabel',
        apellidos: 'López Martínez',
        genero: 'Femenino',
        celular: '+1-555-0124',
        email: 'maria.lopez@email.com',
        fechaNacimiento: '1990-07-22'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');
    XLSX.writeFile(wb, 'plantilla_pacientes.xlsx');
    
    toast.success('Plantilla descargada');
  };

  const validCount = importData.filter(row => row.isValid).length;
  const invalidCount = importData.length - validCount;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Importar Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importar Pacientes desde Excel
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label htmlFor="excel-file">Seleccionar archivo Excel</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar Plantilla
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Campos requeridos:</strong> nombres, apellidos, genero, celular</p>
            <p><strong>Campos opcionales:</strong> email, fechaNacimiento</p>
            <p><strong>Formato de fecha:</strong> YYYY-MM-DD (ej: 1985-03-15)</p>
          </div>

          {importData.length > 0 && (
            <>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  Válidas: {validCount}
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="w-3 h-3" />
                    Inválidas: {invalidCount}
                  </Badge>
                )}
              </div>

              <div className="border rounded-lg flex-1 overflow-hidden">
                <div className="max-h-60 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">Estado</TableHead>
                        <TableHead>Nombres</TableHead>
                        <TableHead>Apellidos</TableHead>
                        <TableHead>Género</TableHead>
                        <TableHead>Celular</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Errores</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {row.isValid ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                          </TableCell>
                          <TableCell>{row.nombres}</TableCell>
                          <TableCell>{row.apellidos}</TableCell>
                          <TableCell>{row.genero}</TableCell>
                          <TableCell>{row.celular}</TableCell>
                          <TableCell>{row.email || '-'}</TableCell>
                          <TableCell>
                            {row.errors.length > 0 && (
                              <div className="text-sm text-destructive">
                                {row.errors.join(', ')}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={validCount === 0 || isProcessing}
          >
            Importar {validCount > 0 ? `${validCount} Pacientes` : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
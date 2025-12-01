import { useState } from 'react';
import { Patient } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AddPatientForm } from './AddPatientForm';
import { ImportPatientsExcel } from './ImportPatientsExcel';
import { Search, User } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: (patient: Omit<Patient, 'id'>) => void;
  onImportPatients: (patients: Omit<Patient, 'id'>[]) => void;
}

export function PatientList({ patients, onSelectPatient, onAddPatient, onImportPatients }: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const getFullName = (patient: Patient) => {
    return `${patient.firstName} ${patient.lastName}`;
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = getFullName(patient).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) ||
           patient.phone.includes(searchTerm) ||
           (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
           patient.gender.toLowerCase().includes(searchLower);
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Lista de Pacientes
            <Badge variant="secondary">{patients.length}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <ImportPatientsExcel onImportPatients={onImportPatients} />
            <AddPatientForm onAddPatient={onAddPatient} />
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, teléfono, email o género..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">{getFullName(patient)}</p>
                <Badge variant="outline" className="text-xs">
                  {patient.gender}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{patient.phone}</span>
                {patient.email && <span>{patient.email}</span>}
              </div>
            </div>
            <Button
              onClick={() => onSelectPatient(patient)}
              size="sm"
            >
              Seleccionar
            </Button>
          </div>
        ))}
        {filteredPatients.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron pacientes</p>
            {searchTerm && (
              <p className="text-sm mt-2">Intenta con otros términos de búsqueda</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
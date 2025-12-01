import { useState } from 'react';
import { Patient } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { UserPlus, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AddPatientFormProps {
  onAddPatient: (patient: Omit<Patient, 'id'>) => void;
}

export function AddPatientForm({ onAddPatient }: AddPatientFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '' as Patient['gender'] | '',
    phone: '',
    email: '',
    dateOfBirth: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Los nombres son requeridos';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Los apellidos son requeridos';
    }

    if (!formData.gender) {
      newErrors.gender = 'El género es requerido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El celular es requerido';
    } else if (!/^[\+]?[\d\s\-\(\)]+$/.test(formData.phone.trim())) {
      newErrors.phone = 'Formato de celular inválido';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newPatient: Omit<Patient, 'id'> = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      gender: formData.gender as Patient['gender'],
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      dateOfBirth: formData.dateOfBirth || undefined
    };

    onAddPatient(newPatient);
    
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      gender: '',
      phone: '',
      email: '',
      dateOfBirth: ''
    });
    setErrors({});
    setIsOpen(false);
    
    toast.success('Paciente añadido exitosamente');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Añadir Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Añadir Nuevo Paciente
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombres *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Ej: María Guadalupe"
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Ej: García López"
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Género *</Label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
              <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-destructive">{errors.gender}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Celular *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Ej: +1-555-0123"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Ej: paciente@email.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Fecha de Nacimiento (opcional)</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Añadir Paciente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
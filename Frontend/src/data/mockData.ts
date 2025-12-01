import { Patient, Exam } from '../types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'María',
    lastName: 'García López',
    gender: 'Femenino',
    phone: '+1-555-0101',
    email: 'maria.garcia@email.com',
    dateOfBirth: '1985-03-15'
  },
  {
    id: '2',
    firstName: 'Juan Carlos',
    lastName: 'Rodríguez',
    gender: 'Masculino',
    phone: '+1-555-0102',
    email: 'juan.rodriguez@email.com',
    dateOfBirth: '1978-07-22'
  },
  {
    id: '3',
    firstName: 'Ana Sofía',
    lastName: 'Martínez',
    gender: 'Femenino',
    phone: '+1-555-0103',
    email: 'ana.martinez@email.com',
    dateOfBirth: '1990-11-08'
  },
  {
    id: '4',
    firstName: 'Carlos Eduardo',
    lastName: 'Silva',
    gender: 'Masculino',
    phone: '+1-555-0104',
    email: 'carlos.silva@email.com',
    dateOfBirth: '1982-05-30'
  },
  {
    id: '5',
    firstName: 'Isabella',
    lastName: 'Fernández',
    gender: 'Femenino',
    phone: '+1-555-0105',
    email: 'isabella.fernandez@email.com',
    dateOfBirth: '1995-12-03'
  },
  {
    id: '6',
    firstName: 'Miguel Ángel',
    lastName: 'Torres',
    gender: 'Masculino',
    phone: '+1-555-0106',
    email: 'miguel.torres@email.com',
    dateOfBirth: '1988-09-18'
  },
  {
    id: '7',
    firstName: 'Lucia Valentina',
    lastName: 'Herrera',
    gender: 'Femenino',
    phone: '+1-555-0107',
    email: 'lucia.herrera@email.com',
    dateOfBirth: '1993-04-12'
  },
  {
    id: '8',
    firstName: 'Roberto Alejandro',
    lastName: 'Cruz',
    gender: 'Masculino',
    phone: '+1-555-0108',
    email: 'roberto.cruz@email.com',
    dateOfBirth: '1979-10-25'
  }
];

export const mockExams: Exam[] = [
  {
    id: '1',
    name: 'Hemograma Completo',
    category: 'Hematología',
    basePrice: 25.00,
    description: 'Análisis completo de células sanguíneas'
  },
  {
    id: '2',
    name: 'Perfil Lipídico',
    category: 'Química Sanguínea',
    basePrice: 35.00,
    description: 'Evaluación de colesterol y triglicéridos'
  },
  {
    id: '3',
    name: 'Glucosa en Ayunas',
    category: 'Química Sanguínea',
    basePrice: 15.00,
    description: 'Medición de glucosa en sangre'
  },
  {
    id: '4',
    name: 'Función Renal',
    category: 'Química Sanguínea',
    basePrice: 40.00,
    description: 'Creatinina, urea y ácido úrico'
  },
  {
    id: '5',
    name: 'Función Hepática',
    category: 'Química Sanguínea',
    basePrice: 45.00,
    description: 'Enzimas hepáticas y bilirrubina'
  },
  {
    id: '6',
    name: 'Perfil Tiroideo',
    category: 'Hormonas',
    basePrice: 55.00,
    description: 'TSH, T3 y T4'
  },
  {
    id: '7',
    name: 'Examen General de Orina',
    category: 'Uroanálisis',
    basePrice: 20.00,
    description: 'Análisis físico, químico y microscópico'
  },
  {
    id: '8',
    name: 'Radiografía de Tórax',
    category: 'Radiología',
    basePrice: 60.00,
    description: 'Imagen frontal del tórax'
  },
  {
    id: '9',
    name: 'Electrocardiograma',
    category: 'Cardiología',
    basePrice: 30.00,
    description: 'Registro de actividad eléctrica cardíaca'
  },
  {
    id: '10',
    name: 'Ecografía Abdominal',
    category: 'Ultrasonido',
    basePrice: 80.00,
    description: 'Imagen por ultrasonido del abdomen'
  }
];
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

export interface Invoice {
  id: string;
  invoiceNumber: string; 
  patient: Patient;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
}

export interface BillingState {
  selectedPatient: Patient | null;
  cart: CartItem[];
  discount: number;
  invoices: Invoice[];
}
import { useState } from 'react';
import { CartItem, Patient } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ShoppingCart, Trash2, FileText, Percent } from 'lucide-react';

interface BillingCartProps {
  patient: Patient;
  cart: CartItem[];
  discount: number;
  onUpdateDiscount: (discount: number) => void;
  onRemoveFromCart: (examId: string) => void;
  onUpdateQuantity: (examId: string, quantity: number) => void;
  onGenerateInvoice: () => void;
  onBackToPatients: () => void;
}

export function BillingCart({ 
  patient, 
  cart, 
  discount, 
  onUpdateDiscount, 
  onRemoveFromCart, 
  onUpdateQuantity,
  onGenerateInvoice,
  onBackToPatients 
}: BillingCartProps) {
  const [discountInput, setDiscountInput] = useState(discount.toString());

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handleDiscountChange = (value: string) => {
    setDiscountInput(value);
    const numValue = parseFloat(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      onUpdateDiscount(numValue);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'NIO'
    }).format(amount);
  };

  const getFullName = (patient: Patient) => {
    return `${patient.firstName} ${patient.lastName}`;
  };

  return (
    <div className="space-y-6">
      {/* Patient Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Facturación - {getFullName(patient)}
            </CardTitle>
            <Button variant="outline" onClick={onBackToPatients}>
              Cambiar Paciente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Teléfono:</span> {patient.phone}</p>
              <p><span className="font-medium">Género:</span> {patient.gender}</p>
            </div>
            <div>
              {patient.email && <p><span className="font-medium">Email:</span> {patient.email}</p>}
              {patient.dateOfBirth && <p><span className="font-medium">Fecha de Nacimiento:</span> {patient.dateOfBirth}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cart Items */}
      <Card>
        <CardHeader>
          <CardTitle>Exámenes Seleccionados</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay exámenes seleccionados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.exam.name}</p>
                    <p className="text-sm text-muted-foreground">{item.exam.category}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`quantity-${item.exam.id}`} className="text-sm">Cant:</Label>
                      <Input
                        id={`quantity-${item.exam.id}`}
                        type="number"
                        min="1"
                        max="10"
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.exam.id, parseInt(e.target.value) || 1)}
                        className="w-16"
                      />
                    </div>
                    
                    <div className="text-right min-w-[80px]">
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} c/u</p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFromCart(item.exam.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Summary */}
      {cart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Facturación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="discount" className="flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Descuento (%):
              </Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={discountInput}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="w-20"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento ({discount}%):</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-medium text-lg">
                <span>Total a Pagar:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" disabled={cart.length === 0}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generar Factura PDF
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Facturación</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Está seguro de que desea generar la factura para {getFullName(patient)} por un total de {formatCurrency(total)}?
                    Esta acción creará un recibo PDF y no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onGenerateInvoice}>
                    Confirmar y Generar PDF
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
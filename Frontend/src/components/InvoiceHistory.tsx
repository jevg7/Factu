import { Invoice, Patient } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { FileText, Download, Calendar, User } from 'lucide-react';

interface InvoiceHistoryProps {
  invoices: Invoice[];
  onDownloadInvoice: (invoice: Invoice) => void;
}

// InvoiceHistory.tsx (arriba de export function)
export async function fetchInvoiceById(id: number) {
  const res = await fetch(`/api/invoices/${id}`);
  if (!res.ok) throw new Error("No se pudo cargar la factura");
  return res.json();
}


export function InvoiceHistory({ invoices, onDownloadInvoice }: InvoiceHistoryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const safeFormatDate = (value?: string | null) => {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('es-NI', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFullName = (patient?: Patient | null) => {
    const first = patient?.firstName ?? '';
    const last = patient?.lastName ?? '';
    const full = `${first} ${last}`.trim();
    return full || 'Paciente no disponible';
  };

  const safeTime = (v: unknown) => {
    const t = new Date(v as any).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  // OJO: no mutar props
  const sortedInvoices = [...invoices].sort((a, b) => safeTime(b.createdAt) - safeTime(a.createdAt));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Historial de Facturas
          <Badge variant="secondary">{invoices.length}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Sin facturas generadas</p>
            <p className="text-sm">Las facturas aparecerán aquí una vez que genere la primera factura.</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {sortedInvoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{invoice.invoiceNumber}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {safeFormatDate((invoice as any).issuedAt ?? (invoice as any).date ?? invoice.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{getFullName((invoice as any).patient)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-lg">{formatCurrency(Number(invoice.total ?? 0))}</p>
                      {Number(invoice.discount ?? 0) > 0 && (
                        <p className="text-sm text-green-600">Descuento: {invoice.discount}%</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Exámenes realizados:</p>

                    {(invoice.items ?? []).map((item: any, index: number) => {
                      const qty = Number(item?.quantity ?? 1);
                      const price = Number(item?.price ?? 0);
                      const examName =
                        item?.exam?.name ??
                        item?.examName ??
                        item?.name ??
                        'Examen (sin detalle)';

                      return (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {examName}
                            {qty > 1 && <span className="text-muted-foreground ml-1">(x{qty})</span>}
                          </span>
                          <span>{formatCurrency(price * qty)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Total de exámenes:{' '}
                      {(invoice.items ?? []).reduce((total: number, item: any) => total + Number(item?.quantity ?? 1), 0)}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadInvoice(invoice)}
                      className="gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Descargar PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

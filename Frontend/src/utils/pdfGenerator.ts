import jsPDF from 'jspdf';
import { Invoice } from '../types';

function safeParseDate(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-NI', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const safeFormatDate = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-NI', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export function generateInvoicePDF(invoice: Invoice): void {
  const fecha = safeParseDate(
    (invoice as any).issuedAt ?? (invoice as any).date
  );
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Formato de recibo pequeño (80mm ancho)
  });

  // Configurar fuente
  doc.setFont('helvetica');

  let yPosition = 10;
  const lineHeight = 4;
  const leftMargin = 5;
  const rightMargin = 75;

  // Título del establecimiento
  doc.setFontSize(12);
  doc.text('CLÍNICA MÉDICA', leftMargin, yPosition, { align: 'left' });
  yPosition += lineHeight + 2;

  doc.setFontSize(8);
  doc.text('Centro de Diagnóstico', leftMargin, yPosition);
  yPosition += lineHeight;
  doc.text('Tel: +1-555-CLINIC', leftMargin, yPosition);
  yPosition += lineHeight;
  doc.text('clinica@email.com', leftMargin, yPosition);
  yPosition += lineHeight + 3;

  // Línea separadora
  doc.line(leftMargin, yPosition, rightMargin, yPosition);
  yPosition += 3;

  // Información de la factura
  doc.setFontSize(9);
  doc.text(`FACTURA #${invoice.invoiceNumber}`, leftMargin, yPosition);
  yPosition += lineHeight + 1;

  const date = new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(invoice.createdAt);

  const fechaFact = safeFormatDate(invoice.issuedAt ?? invoice.date);

  doc.text(`Fecha: ${fechaFact}`, leftMargin, yPosition);

  doc.setFontSize(7);
  doc.text(`Fecha: ${date}`, leftMargin, yPosition);
  yPosition += lineHeight + 2;

  // Información del paciente
  doc.setFontSize(8);
  doc.text('PACIENTE:', leftMargin, yPosition);
  yPosition += lineHeight;
  const patientName = `${invoice.patient.firstName} ${invoice.patient.lastName}`;
  doc.text(patientName, leftMargin, yPosition);
  yPosition += lineHeight;
  doc.text(invoice.patient.phone, leftMargin, yPosition);
  yPosition += lineHeight;
  doc.text(`Género: ${invoice.patient.gender}`, leftMargin, yPosition);
  yPosition += lineHeight + 3;

  // Línea separadora
  doc.line(leftMargin, yPosition, rightMargin, yPosition);
  yPosition += 3;

  // Encabezado de exámenes
  doc.setFontSize(7);
  doc.text('DESCRIPCIÓN', leftMargin, yPosition);
  doc.text('CANT', 45, yPosition);
  doc.text('PRECIO', 55, yPosition);
  doc.text('TOTAL', 68, yPosition);
  yPosition += lineHeight;

  // Línea separadora
  doc.line(leftMargin, yPosition, rightMargin, yPosition);
  yPosition += 2;

  // Lista de exámenes
  doc.setFontSize(6);
  invoice.items.forEach((item) => {
    const examName = item.exam.name;
    if (examName.length > 25) {
      // Dividir en líneas si es muy largo
      const words = examName.split(' ');
      let line1 = '';
      let line2 = '';
      let currentLength = 0;
      
      for (const word of words) {
        if (currentLength + word.length + 1 <= 25) {
          line1 += (line1 ? ' ' : '') + word;
          currentLength += word.length + 1;
        } else {
          line2 += (line2 ? ' ' : '') + word;
        }
      }
      
      doc.text(line1, leftMargin, yPosition);
      yPosition += 3;
      if (line2) {
        doc.text(line2, leftMargin, yPosition);
        yPosition += 3;
      }
    } else {
      doc.text(examName, leftMargin, yPosition);
      yPosition += 3;
    }

    const quantity = item.quantity.toString();
    const unitPrice = `$${item.price.toFixed(2)}`;
    const totalPrice = `$${(item.price * item.quantity).toFixed(2)}`;

    doc.text(quantity, 45, yPosition - 3);
    doc.text(unitPrice, 55, yPosition - 3);
    doc.text(totalPrice, 68, yPosition - 3);
    yPosition += 2;
  });

  yPosition += 2;
  // Línea separadora
  doc.line(leftMargin, yPosition, rightMargin, yPosition);
  yPosition += 3;

  // Totales
  doc.setFontSize(7);
  const subtotal = `$${invoice.subtotal.toFixed(2)}`;
  doc.text('Subtotal:', 45, yPosition);
  doc.text(subtotal, 68, yPosition);
  yPosition += lineHeight;

  if (invoice.discount > 0) {
    const discountAmount = `$${((invoice.subtotal * invoice.discount) / 100).toFixed(2)}`;
    doc.text(`Descuento (${invoice.discount}%):`, 45, yPosition);
    doc.text(`-${discountAmount}`, 68, yPosition);
    yPosition += lineHeight;
  }

  // Línea separadora antes del total
  doc.line(45, yPosition, rightMargin, yPosition);
  yPosition += 2;

  // Total final
  doc.setFontSize(8);
  const total = `$${invoice.total.toFixed(2)}`;
  doc.text('TOTAL:', 45, yPosition);
  doc.text(total, 68, yPosition);
  yPosition += lineHeight + 5;

  // Línea separadora final
  doc.line(leftMargin, yPosition, rightMargin, yPosition);
  yPosition += 3;

  // Mensaje de agradecimiento
  doc.setFontSize(6);
  doc.text('¡Gracias por su confianza!', leftMargin, yPosition);
  yPosition += 3;
  doc.text('Conserve este recibo', leftMargin, yPosition);

  // Guardar el PDF
  const fileName = `Factura_${invoice.invoiceNumber}_${patientName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
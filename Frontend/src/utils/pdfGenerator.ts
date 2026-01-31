import jsPDF from 'jspdf';
import { Invoice } from '../types';


function toDate(value?: string | Date | null): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // Intento estándar (ISO)
  const iso = new Date(value);
  if (!isNaN(iso.getTime())) return iso;

  // Intento DD-MM-YYYY o DD/MM/YYYY
  const clean = value.replace(/\//g, "-");
  const parts = clean.split("-");
  if (parts.length === 3) {
    const [d, m, y] = parts.map(Number);
    const parsed = new Date(y, m - 1, d);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function formatDate(value?: string | Date | null): string {
  const d = toDate(value);
  if (!d) return "—";

  return d.toLocaleDateString("es-NI", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function formatDateTime(value?: string | Date | null): string {
  const d = toDate(value);
  if (!d) return "—";

  return d.toLocaleDateString("es-NI", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* ---------------------------------------------------------
   GENERADOR PDF
--------------------------------------------------------- */

export function generateInvoicePDF(invoice: Invoice): void {
  const fechaFactura = formatDate(invoice.issuedAt ?? invoice.date);
  const fechaCreacion = formatDateTime(invoice.createdAt);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200]
  });

  doc.setFont('helvetica');

  let yPosition = 10;
  const lineHeight = 4;
  const leftMargin = 5;
  const rightMargin = 75;

  // Encabezado del establecimiento
  doc.setFontSize(12);
  doc.text('CLÍNICA MÉDICA', leftMargin, yPosition);
  yPosition += lineHeight + 2;

  doc.setFontSize(8);
  doc.text('Centro de Diagnóstico', leftMargin, yPosition); yPosition += lineHeight;
  doc.text('Tel: +1-555-CLINIC', leftMargin, yPosition); yPosition += lineHeight;
  doc.text('clinica@email.com', leftMargin, yPosition); yPosition += lineHeight + 3;

  doc.line(leftMargin, yPosition, rightMargin, yPosition);
  yPosition += 3;

  // Factura
  doc.setFontSize(9);
  doc.text(`FACTURA #${invoice.invoiceNumber}`, leftMargin, yPosition);
  yPosition += lineHeight;

  doc.text(`Fecha factura: ${fechaFactura}`, leftMargin, yPosition);
  yPosition += lineHeight;

  doc.setFontSize(7);
  doc.text(`Emitido: ${fechaCreacion}`, leftMargin, yPosition);
  yPosition += lineHeight + 2;

  // Paciente
  doc.setFontSize(8);
  doc.text('PACIENTE:', leftMargin, yPosition);
  yPosition += lineHeight;

  const patientName = `${invoice.patient.firstName} ${invoice.patient.lastName}`;
  doc.text(patientName, leftMargin, yPosition); yPosition += lineHeight;
  doc.text(invoice.patient.phone, leftMargin, yPosition); yPosition += lineHeight;
  doc.text(`Género: ${invoice.patient.gender}`, leftMargin, yPosition);
  yPosition += lineHeight + 3;

  doc.line(leftMargin, yPosition, rightMargin, yPosition);
  yPosition += 3;

  // Encabezado de exámenes
  doc.setFontSize(7);
  doc.text('DESCRIPCIÓN', leftMargin, yPosition);
  doc.text('CANT', 45, yPosition);
  doc.text('PRECIO', 55, yPosition);
  doc.text('TOTAL', 68, yPosition);
  yPosition += lineHeight;

  doc.line(leftMargin, yPosition, rightMargin, yPosition);
  yPosition += 2;

  // Items
  doc.setFontSize(6);

  invoice.items.forEach((item) => {
    const examName = item.exam.name ?? "";

    if (examName.length > 25) {
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
  doc.line(leftMargin, yPosition, rightMargin, yPosition);
  yPosition += 3;

  // Totales
  doc.setFontSize(7);
  doc.text('Subtotal:', 45, yPosition);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, 68, yPosition);
  yPosition += lineHeight;

  if (invoice.discount > 0) {
    const discountAmount = `$${((invoice.subtotal * invoice.discount) / 100).toFixed(2)}`;
    doc.text(`Descuento (${invoice.discount}%):`, 45, yPosition);
    doc.text(`-${discountAmount}`, 68, yPosition);
    yPosition += lineHeight;
  }

  doc.line(45, yPosition, rightMargin, yPosition);
  yPosition += 2;

  doc.setFontSize(8);
  doc.text('TOTAL:', 45, yPosition);
  doc.text(`$${invoice.total.toFixed(2)}`, 68, yPosition);
  yPosition += lineHeight + 5;

  doc.line(leftMargin, yPosition, rightMargin, yPosition);
  yPosition += 3;

  // Mensaje final
  doc.setFontSize(6);
  doc.text('¡Gracias por su confianza!', leftMargin, yPosition);
  yPosition += 3;
  doc.text('Conserve este recibo', leftMargin, yPosition);

  // Guardar
  const fileName = `Factura_${invoice.invoiceNumber}_${patientName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

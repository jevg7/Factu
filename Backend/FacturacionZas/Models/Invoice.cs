using System;
using System.Collections.Generic;

namespace FacturacionZas.Models
{
    public class Invoice
    {
        public int Id { get; set; }

        public string InvoiceNumber { get; set; } = string.Empty;

        public int PatientId { get; set; }
        public Patient Patient { get; set; } = null!;

        public decimal Subtotal { get; set; }
        public decimal Discount { get; set; }   // porcentaje (0–100)
        public decimal Total { get; set; }

        public DateTime CreatedAt { get; set; }

        public List<InvoiceItem> Items { get; set; } = new();
    }
}

using System;
using System.Text.Json.Serialization;

namespace FacturacionZas.Models
{
    public class InvoiceItem
    {
        public int Id { get; set; }

        public int InvoiceId { get; set; }
        public Invoice Invoice { get; set; } = null!;

        public int ExamId { get; set; }     
        public Exam Exam { get; set; } = null!; 

        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
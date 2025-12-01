using System;
using System.Text.Json.Serialization;

namespace FacturacionZas.Models
{
    public class InvoiceItem
    {
        public int Id { get; set; }

        public int InvoiceId { get; set; }

        [JsonIgnore]
        public Invoice Invoice { get; set; } = null!;

        public string ExamName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }  
    }
}
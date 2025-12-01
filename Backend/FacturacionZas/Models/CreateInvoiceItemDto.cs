using System.Collections.Generic;

namespace FacturacionZas.Models
{
    public class CreateInvoiceItemDto
    {
        public string ExamName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }   // precio unitario
    }

    public class CreateInvoiceDto
    {
        public int PatientId { get; set; }
        public decimal Discount { get; set; }   // porcentaje 0–100
        public List<CreateInvoiceItemDto> Items { get; set; } = new();
    }
}

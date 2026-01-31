using System.Collections.Generic;

namespace FacturacionZas.Models
{
    public class CreateInvoiceItemDto
    {
        public int ExamId { get; set; }          
        public int Quantity { get; set; }
        public decimal? Price { get; set; }      
    }

    public class CreateInvoiceDto
    {
        public int PatientId { get; set; }
        public decimal Discount { get; set; }   
        public List<CreateInvoiceItemDto> Items { get; set; } = new();
    }
}



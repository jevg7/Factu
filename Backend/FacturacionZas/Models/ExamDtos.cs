namespace FacturacionZas.Models
{
    public class CreateExamDto
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateExamDto : CreateExamDto
    {
       
    }
}
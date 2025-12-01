namespace FacturacionZas.Models
{
    public class Exam
    {
        public int Id { get; set; }  
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal BasePrice { get; set; }

        public string Category { get; set; } = null!;

    }
}

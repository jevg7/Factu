namespace FacturacionZas.Models
{
    public class Patient
    {
        public int Id { get; set; }  
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Gender { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string? Email { get; set; }

        
        public DateOnly? DateOfBirth { get; set; }
    }
}
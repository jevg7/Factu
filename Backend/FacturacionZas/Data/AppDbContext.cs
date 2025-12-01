using FacturacionZas.Models;
using Microsoft.EntityFrameworkCore;

namespace FacturacionZas.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<Invoice> Invoices => Set<Invoice>();
        public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
        public DbSet<Exam> Exams => Set<Exam>();


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Relación Invoice -> Patient (muchas facturas por paciente)
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Patient)
                .WithMany()
                .HasForeignKey(i => i.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relación Invoice -> Items (uno a muchos)
            modelBuilder.Entity<InvoiceItem>()
                .HasOne(ii => ii.Invoice)
                .WithMany(i => i.Items)
                .HasForeignKey(ii => ii.InvoiceId);

            
            modelBuilder.Entity<Invoice>()
                .Property(i => i.Subtotal)
                .HasColumnType("numeric(12,2)");

            modelBuilder.Entity<Invoice>()
                .Property(i => i.Total)
                .HasColumnType("numeric(12,2)");

            modelBuilder.Entity<InvoiceItem>()
                .Property(ii => ii.Price)
                .HasColumnType("numeric(12,2)");

            modelBuilder.Entity<Exam>()
                .Property(e => e.BasePrice)
                .HasColumnType("numeric(10,2)");
        }
    }
}

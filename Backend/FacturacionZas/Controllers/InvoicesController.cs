using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FacturacionZas.Data;
using FacturacionZas.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacturacionZas.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public InvoicesController(AppDbContext db)
        {
            _db = db;
        }

        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetAll()
        {
            var invoices = await _db.Invoices
                .Include(i => i.Patient)
                .Include(i => i.Items)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(invoices);
        }

        
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Invoice>> GetById(int id)
        {
            var invoice = await _db.Invoices
                .Include(i => i.Patient)
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
                return NotFound();

            return Ok(invoice);
        }

       
        [HttpPost]
        public async Task<ActionResult<Invoice>> Create([FromBody] CreateInvoiceDto dto)
        {
            var patient = await _db.Patients.FindAsync(dto.PatientId);
            if (patient == null)
                return BadRequest("El paciente no existe.");

            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest("La factura debe tener al menos un examen.");

            var subtotal = dto.Items.Sum(i => i.Price * i.Quantity);
            var discountAmount = subtotal * dto.Discount / 100m;
            var total = subtotal - discountAmount;

            var invoice = new Invoice
            {
                PatientId = dto.PatientId,
                Patient = patient,
                InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMddHHmmss}",
                Subtotal = subtotal,
                Discount = dto.Discount,
                Total = total,
                CreatedAt = DateTime.UtcNow,
                Items = dto.Items.Select(i => new InvoiceItem
                {
                    ExamName = i.ExamName,
                    Quantity = i.Quantity,
                    Price = i.Price
                }).ToList()
            };

            _db.Invoices.Add(invoice);
            await _db.SaveChangesAsync();

            
            await _db.Entry(invoice).Reference(i => i.Patient).LoadAsync();
            await _db.Entry(invoice).Collection(i => i.Items).LoadAsync();

            return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, invoice);
        }
    }
}

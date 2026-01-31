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
        private readonly AppDbContext _context;

        public InvoicesController(AppDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetAll()
        {
            var invoices = await _context.Invoices
                .Include(i => i.Patient)
                .Include(i => i.Items)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(invoices);
        }

        
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Invoice>> GetById(int id)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Patient)
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
                return NotFound();

            return Ok(invoice);
        }


        [HttpPost]
        public async Task<ActionResult<Invoice>> CreateInvoice([FromBody] CreateInvoiceDto dto)
        {
            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest("Debe incluir al menos 1 item.");

            // Traer exámenes en batch (más eficiente)
            var examIds = dto.Items.Select(x => x.ExamId).Distinct().ToList();
            var exams = await _context.Exams
                .Where(e => examIds.Contains(e.Id))
                .ToDictionaryAsync(e => e.Id);

            // Validar que existan
            foreach (var id in examIds)
                if (!exams.ContainsKey(id))
                    return BadRequest($"ExamId inválido: {id}");

            var invoice = new Invoice
            {
                PatientId = dto.PatientId,
                Discount = dto.Discount,
                CreatedAt = DateTime.UtcNow,
                Items = new List<InvoiceItem>()
            };

            foreach (var it in dto.Items)
            {
                var exam = exams[it.ExamId];

                
                var unitPrice = it.Price ?? exam.BasePrice;

               

                invoice.Items.Add(new InvoiceItem
                {
                    ExamId = it.ExamId,
                    Quantity = it.Quantity,
                    Price = unitPrice
                });
            }

            // Totales
            invoice.Subtotal = invoice.Items.Sum(x => x.Price * x.Quantity);
            var discountAmount = invoice.Subtotal * (invoice.Discount / 100m);
            invoice.Total = invoice.Subtotal - discountAmount;

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInvoiceById), new { id = invoice.Id }, invoice);
        }



        [HttpGet("{id}")]
        public async Task<ActionResult<Invoice>> GetInvoiceById(int id)
        {
            var inv = await _context.Invoices
                .AsNoTracking()
                .Include(i => i.Patient)
                .Include(i => i.Items)
                    .ThenInclude(ii => ii.Exam)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inv == null) return NotFound();
            return inv;
        }




    }
}

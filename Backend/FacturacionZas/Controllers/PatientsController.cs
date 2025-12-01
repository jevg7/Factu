using FacturacionZas.Data;
using FacturacionZas.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FacturacionZas.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PatientsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Patient>>> GetAll()
        {
            var patients = await _db.Patients
                .OrderByDescending(p => p.Id)
                .ToListAsync();

            return Ok(patients);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Patient>> GetById(int id)
        {
            var patient = await _db.Patients.FindAsync(id);
            if (patient == null) return NotFound();
            return Ok(patient);
        }

        [HttpPost]
        public async Task<ActionResult<Patient>> Create([FromBody] Patient dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FirstName) ||
                string.IsNullOrWhiteSpace(dto.LastName))
            {
                return BadRequest("El nombre y apellido son obligatorios");
            }

            _db.Patients.Add(dto);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Patient>> Update(int id, [FromBody] Patient dto)
        {
            var existing = await _db.Patients.FindAsync(id);
            if (existing == null) return NotFound();

            existing.FirstName = dto.FirstName;
            existing.LastName = dto.LastName;
            existing.Gender = dto.Gender;
            existing.Phone = dto.Phone;
            existing.Email = dto.Email;
            existing.DateOfBirth = dto.DateOfBirth;

            await _db.SaveChangesAsync();

            return Ok(existing);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var patient = await _db.Patients.FindAsync(id);
            if (patient == null) return NotFound();

            _db.Patients.Remove(patient);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
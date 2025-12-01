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
    public class ExamsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ExamsController(AppDbContext db)
        {
            _db = db;
        }

        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Exam>>> GetAll()
        {
            var exams = await _db.Exams
                .OrderBy(e => e.Category)
                .ThenBy(e => e.Name)
                .ToListAsync();

            return Ok(exams);
        }

        
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Exam>> GetById(int id)
        {
            var exam = await _db.Exams.FindAsync(id);
            if (exam == null) return NotFound();

            return Ok(exam);
        }

        
        [HttpPost]
        public async Task<ActionResult<Exam>> Create([FromBody] CreateExamDto dto)
        {
            var exam = new Exam
            {
                Name = dto.Name,
                Category = dto.Category,
                BasePrice = dto.BasePrice,
                Description = dto.Description
            };

            _db.Exams.Add(exam);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = exam.Id }, exam);
        }

        
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateExamDto dto)
        {
            var exam = await _db.Exams.FindAsync(id);
            if (exam == null) return NotFound();

            exam.Name = dto.Name;
            exam.Category = dto.Category;
            exam.BasePrice = dto.BasePrice;
            exam.Description = dto.Description;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var exam = await _db.Exams.FindAsync(id);
            if (exam == null) return NotFound();

            _db.Exams.Remove(exam);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}

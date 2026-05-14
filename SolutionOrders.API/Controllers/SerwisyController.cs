using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Data;
using SolutionOrders.API.Models;

namespace SolutionOrders.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SerwisyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SerwisyController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var serwisy = _context.Serwisy
                .Include(s => s.Rower)
                .ToList();

            return Ok(serwisy);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var serwis = _context.Serwisy
                .Include(s => s.Rower)
                .FirstOrDefault(s => s.Id == id);

            if (serwis == null)
                return NotFound();

            return Ok(serwis);
        }

        [HttpPost]
        public IActionResult Post(Serwis serwis)
        {
            var rower = _context.Rowery.Find(serwis.RowerId);

            if (rower == null)
                return BadRequest($"Rower o ID {serwis.RowerId} nie istnieje.");

            rower.Status = "Serwis";

            _context.Serwisy.Add(serwis);
            _context.SaveChanges();

            return Ok(serwis);
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, Serwis updated)
        {
            var serwis = _context.Serwisy.Find(id);

            if (serwis == null)
                return NotFound();

            serwis.RowerId = updated.RowerId;
            serwis.OpisUsterki = updated.OpisUsterki;
            serwis.Status = updated.Status;

            var rower = _context.Rowery.Find(updated.RowerId);

            if (rower != null)
            {
                if (updated.Status == "Zakończone")
                    rower.Status = "Dostępny";
                else
                    rower.Status = "Serwis";
            }

            _context.SaveChanges();

            return Ok(serwis);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var serwis = _context.Serwisy.Find(id);

            if (serwis == null)
                return NotFound();

            var rower = _context.Rowery.Find(serwis.RowerId);

            if (rower != null)
                rower.Status = "Dostępny";

            _context.Serwisy.Remove(serwis);
            _context.SaveChanges();

            return Ok();
        }
    }
}
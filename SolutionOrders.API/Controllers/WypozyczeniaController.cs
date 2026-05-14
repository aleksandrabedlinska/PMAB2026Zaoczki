using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Data;
using SolutionOrders.API.Models;

namespace SolutionOrders.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WypozyczeniaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WypozyczeniaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var wypozyczenia = _context.Wypozyczenia
                .Include(w => w.Klient)
                .Include(w => w.PozycjeWypozyczenia)
                    .ThenInclude(p => p.Rower)
                .ToList();

            return Ok(wypozyczenia);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var wypozyczenie = _context.Wypozyczenia
                .Include(w => w.Klient)
                .Include(w => w.PozycjeWypozyczenia)
                    .ThenInclude(p => p.Rower)
                .FirstOrDefault(w => w.Id == id);

            if (wypozyczenie == null)
                return NotFound();

            return Ok(wypozyczenie);
        }

        [HttpPost]
        public IActionResult Post(Wypozyczenie wypozyczenie)
        {
            _context.Wypozyczenia.Add(wypozyczenie);

            foreach (var pozycja in wypozyczenie.PozycjeWypozyczenia)
            {
                var rower = _context.Rowery.Find(pozycja.RowerId);

                if (rower == null)
                    return BadRequest($"Rower o ID {pozycja.RowerId} nie istnieje.");

                rower.Status = "Wypożyczony";
            }

            _context.SaveChanges();

            return Ok(wypozyczenie);
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, Wypozyczenie updated)
        {
            var wypozyczenie = _context.Wypozyczenia
                .Include(w => w.PozycjeWypozyczenia)
                .FirstOrDefault(w => w.Id == id);

            if (wypozyczenie == null)
                return NotFound();

            wypozyczenie.KlientId = updated.KlientId;
            wypozyczenie.DataWypozyczenia = updated.DataWypozyczenia;
            wypozyczenie.DataZwrotu = updated.DataZwrotu;
            wypozyczenie.Status = updated.Status;

            foreach (var pozycja in wypozyczenie.PozycjeWypozyczenia)
            {
                var rower = _context.Rowery.Find(pozycja.RowerId);

                if (rower == null)
                    continue;

                if (updated.Status == "Zakończone" || updated.Status == "Anulowane")
                {
                    rower.Status = "Dostępny";
                }
                else if (updated.Status == "Aktywne")
                {
                    rower.Status = "Wypożyczony";
                }
            }

            _context.SaveChanges();

            return Ok(wypozyczenie);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var wypozyczenie = _context.Wypozyczenia
                .Include(w => w.PozycjeWypozyczenia)
                .FirstOrDefault(w => w.Id == id);

            if (wypozyczenie == null)
                return NotFound();

            foreach (var pozycja in wypozyczenie.PozycjeWypozyczenia)
            {
                var rower = _context.Rowery.Find(pozycja.RowerId);
                if (rower != null)
                    rower.Status = "Dostępny";
            }

            _context.Wypozyczenia.Remove(wypozyczenie);
            _context.SaveChanges();

            return Ok();
        }
    }
}
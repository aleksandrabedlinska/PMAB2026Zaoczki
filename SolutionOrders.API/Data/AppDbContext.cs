using Microsoft.EntityFrameworkCore;
using SolutionOrders.API.Models;

namespace SolutionOrders.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Rower> Rowery { get; set; }
        public DbSet<Klient> Klienci { get; set; }
        public DbSet<TypRoweru> TypyRowerow { get; set; }
        public DbSet<Kategoria> Kategorie { get; set; }
        public DbSet<Wypozyczenie> Wypozyczenia { get; set; }
        public DbSet<PozycjaWypozyczenia> PozycjeWypozyczenia { get; set; }
        public DbSet<Serwis> Serwisy { get; set; }
        public DbSet<Platnosc> Platnosci { get; set; }
        public DbSet<MetodaPlatnosci> MetodyPlatnosci { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // RELACJA: Klient 1 → wiele Wypozyczen
            modelBuilder.Entity<Wypozyczenie>()
                .HasOne(w => w.Klient)
                .WithMany(k => k.Wypozyczenia)
                .HasForeignKey(w => w.KlientId);

            // RELACJA: Wypozyczenie 1 → wiele Pozycji
            modelBuilder.Entity<PozycjaWypozyczenia>()
                .HasOne(p => p.Wypozyczenie)
                .WithMany(w => w.PozycjeWypozyczenia)
                .HasForeignKey(p => p.WypozyczenieId);

            // RELACJA: Rower 1 → wiele Pozycji
            modelBuilder.Entity<PozycjaWypozyczenia>()
                .HasOne(p => p.Rower)
                .WithMany(r => r.PozycjeWypozyczenia)
                .HasForeignKey(p => p.RowerId);

            // SEEDER
            modelBuilder.Entity<Rower>().HasData(
                new Rower
                {
                    Id = 1,
                    Nazwa = "Trek Marlin 5",
                    Typ = "MTB",
                    Cena = 15,
                    Status = "Dostępny"
                },
                new Rower
                {
                    Id = 2,
                    Nazwa = "Kross Evado",
                    Typ = "Trekking",
                    Cena = 12,
                    Status = "Dostępny"
                }
            );

            modelBuilder.Entity<Klient>().HasData(
                new Klient
                {
                    Id = 1,
                    Imie = "Jan",
                    Nazwisko = "Kowalski",
                    Telefon = "123456789"
                }
            );

            modelBuilder.Entity<Wypozyczenie>().HasData(
                new Wypozyczenie
                {
                    Id = 1,
                    KlientId = 1,
                    DataWypozyczenia = new DateTime(2025, 1, 1),
                    Status = "Aktywne"
                }
            );

            modelBuilder.Entity<PozycjaWypozyczenia>().HasData(
                new PozycjaWypozyczenia
                {
                    Id = 1,
                    WypozyczenieId = 1,
                    RowerId = 1,
                    CenaZaGodzine = 15
                }
            );
            modelBuilder.Entity<Serwis>()
                .HasOne(s => s.Rower)
                .WithMany()
                .HasForeignKey(s => s.RowerId);
        }
    }
}
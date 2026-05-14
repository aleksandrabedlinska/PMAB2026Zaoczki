namespace SolutionOrders.API.Models
{
    public class Wypozyczenie
    {
        public int Id { get; set; }

        public int KlientId { get; set; }
        public Klient? Klient { get; set; }

        public DateTime DataWypozyczenia { get; set; }
        public DateTime? DataZwrotu { get; set; }
        public string Status { get; set; } = "";

        public List<PozycjaWypozyczenia> PozycjeWypozyczenia { get; set; } = new();
    }
}
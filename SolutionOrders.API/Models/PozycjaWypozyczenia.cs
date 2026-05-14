namespace SolutionOrders.API.Models
{
    public class PozycjaWypozyczenia
    {
        public int Id { get; set; }

        public int WypozyczenieId { get; set; }
        public Wypozyczenie? Wypozyczenie { get; set; }

        public int RowerId { get; set; }
        public Rower? Rower { get; set; }

        public decimal CenaZaGodzine { get; set; }
    }
}
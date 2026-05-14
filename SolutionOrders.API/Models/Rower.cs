namespace SolutionOrders.API.Models
{
    public class Rower
    {
        public int Id { get; set; }
        public string Nazwa { get; set; } = "";
        public string Typ { get; set; } = "";
        public decimal Cena { get; set; }
        public string Status { get; set; } = "";

        public List<PozycjaWypozyczenia> PozycjeWypozyczenia { get; set; } = new();
    }
}
namespace SolutionOrders.API.Models
{
    public class Serwis
    {
        public int Id { get; set; }

        public int RowerId { get; set; }
        public Rower? Rower { get; set; }

        public string OpisUsterki { get; set; } = "";
        public string Status { get; set; } = "";
    }
}
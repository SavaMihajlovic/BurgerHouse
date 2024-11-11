public class Reservation
{
    public required string ReservationId { get; set; } 
    public required string UserId { get; set; }
    public required int TableNumber { get; set; } 
    public required DateTime ReservationTime { get; set; } 
}

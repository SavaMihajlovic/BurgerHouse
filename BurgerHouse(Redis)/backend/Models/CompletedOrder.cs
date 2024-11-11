public class CompletedOrder
{
    public required string OrderId { get; set; }
    public required string UserId { get; set; }
    public required List<OrderItem> Items { get; set; }
    public required DateTime CompletedAt { get; set; } 
}

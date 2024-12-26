public class Order
{
    public required string UserID { get; set; }

    public required List<OrderItem> Items { get; set; }
    public required DateTime CreatedAt { get; set; }
}
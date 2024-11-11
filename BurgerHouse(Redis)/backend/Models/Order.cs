public class Order
{
    public required string OrderID { get; set; }
    public required string UserID { get; set; }

    public required List<OrderItem> Items { get; set; }
    public required string Status { get; set; } 

    public required DateTime CreatedAt { get; set; }
}
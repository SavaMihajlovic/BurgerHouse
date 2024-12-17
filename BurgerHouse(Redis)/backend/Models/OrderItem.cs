public class OrderItem
{
    [MaxLength(80)]
    public required string ItemKey { get; set; }
    [Range(1, 100)]
    public required int Quantity { get; set; }
}
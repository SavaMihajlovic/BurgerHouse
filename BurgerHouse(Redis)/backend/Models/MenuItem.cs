public class MenuItem 
{
    [MaxLength(30)]
    public required string Name { get; set; }
    [Range(1,1000)]
    public required double Price { get; set; }
    [MaxLength(80)]
    public required string Description { get; set; }
}
public class User
{
    [Length(3,30)]
    public required string FirstName { get; set; }
    [Length(3,30)]
    public required string LastName { get; set; }
    [MaxLength(50)]
    public required string Email { get; set; }
    [MaxLength(150)]
    public required string Password { get; set; }
    [MaxLength(10)]
    public required string Role { get; set; }

}

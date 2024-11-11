[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly IConnectionMultiplexer _redis;
    private readonly string globalUserKey = "globaluserkey";
    public UserController(IConnectionMultiplexer redis )
    {
        _redis = redis;
    }
    [HttpPost("AddUser")]
    public async Task<ActionResult> AddUser(string name , string email)
    {
        try
        {
            if(string.IsNullOrEmpty(name))
                return BadRequest("User needs a name!");
            if(string.IsNullOrEmpty(email) && email.EndsWith("@gmail.com"))
                return BadRequest("Invalid email!");
            var db = _redis.GetDatabase();
            var userKey = await db.StringIncrementAsync(globalUserKey);
            var redisKey = $"users:{userKey}";
            if(await db.KeyExistsAsync(redisKey))
                return BadRequest("User already exists");
            await db.HashSetAsync(redisKey , 
            [
                new HashEntry("name", name),
                new HashEntry("email",email)
            ]);
            await db.SetAddAsync("users:all" , redisKey);
            return Ok($"User is added succesfully, redisKey={redisKey}");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
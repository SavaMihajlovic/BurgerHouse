[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly IConnectionMultiplexer _redis;

    private readonly string _sessionKey = "sessionKey";
    public UserController(IConnectionMultiplexer redis )
    {
        _redis = redis;
    }
    [HttpPost("Register")]
    public async Task<ActionResult> Register([FromBody]User user)
    {
        try
        {
            if(string.IsNullOrEmpty(user.FirstName) || user.FirstName.Length > 30)
                return BadRequest("Firstname is empty or too long!");
            if(string.IsNullOrEmpty(user.LastName) || user.LastName.Length > 30)
                return BadRequest("Lastname is empty or too long!");
            if(string.IsNullOrEmpty(user.Email) || !user.Email.EndsWith("@gmail.com"))
                return BadRequest("Invalid email!");
            if(string.IsNullOrEmpty(user.Password) || user.Password.Length < 8 || !user.Password.Any(char.IsDigit) || !user.Password.Any(char.IsPunctuation))
                return BadRequest("Password is empty or invalid (atleast 8 characters , atleast one digit and punctuation)");
            var db = _redis.GetDatabase();
            var userKey = user.Email;
            var redisKey = $"user:{userKey}";
            if(await db.KeyExistsAsync(redisKey))
                return BadRequest("User already exists");
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password);
            await db.HashSetAsync(redisKey , 
            [
                new HashEntry("firstname" , user.FirstName),
                new HashEntry("lastname" , user.LastName),
                new HashEntry("password" , hashedPassword),
                new HashEntry("digitalcurrency" , 0.00)
            ]);
            await db.SetAddAsync("users:all" , user.Email);
            return Ok($"Registered sucessfully, redisKey={redisKey}");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("Login/{email}/{password}")]
    public async Task<ActionResult> Login(string email , string password)
    {
        try
        {
            if(string.IsNullOrEmpty(email) || !email.EndsWith("@gmail.com"))
                return BadRequest("Invalid email!");
            if(string.IsNullOrEmpty(password) || password.Length < 8 || !password.Any(char.IsDigit) || !password.Any(char.IsPunctuation))
                return BadRequest("Password is empty or invalid (atleast 8 characters , atleast one digit and punctuation)");
            var db = _redis.GetDatabase();
            var userKey = email;
            var redisKey = $"user:{userKey}";
            if(!await db.KeyExistsAsync(redisKey))
                return BadRequest("User does not exist");

            var hashedPassword = await db.HashGetAsync(redisKey, "password");

            if(!BCrypt.Net.BCrypt.Verify(password , hashedPassword))
                return BadRequest("Incorrect password!");
            var globalSessionKey = await db.StringIncrementAsync(_sessionKey);
            await db.StringSetAsync($"session:{globalSessionKey}" , userKey);
            await db.KeyExpireAsync($"session:{globalSessionKey}" , TimeSpan.FromMinutes(30));
            return Ok(globalSessionKey);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPost("GetSession/{sessionKey}")]
    public async Task<ActionResult> GetSession(string sessionKey)
    {
        try
        {
            if(string.IsNullOrEmpty(sessionKey))
                return BadRequest("session key does not exist");
            var db = _redis.GetDatabase();
            var redisKey = $"session:{sessionKey}";
            if(!await db.KeyExistsAsync(redisKey))
                return NotFound("session does not exist or is expired");
            await db.KeyExpireAsync(redisKey , TimeSpan.FromMinutes(30));
            return Ok("Session extended");
            
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

}
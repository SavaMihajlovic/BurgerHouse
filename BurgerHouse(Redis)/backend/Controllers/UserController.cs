
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
            if(string.IsNullOrEmpty(user.Role))
                return BadRequest("User must have a role");
            if(user.Role!="user" && user.Role!="worker" && user.Role!="admin")
                return BadRequest("User must be worker or user");
            var db = _redis.GetDatabase();
            var userKey = user.Email;
            var redisKey = $"user:{userKey}";
            if(await db.KeyExistsAsync(redisKey))
                return BadRequest("User already exists");
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password);

            var hashEntries = new List<HashEntry>
            {
                new HashEntry("firstname", user.FirstName),
                new HashEntry("lastname", user.LastName),
                new HashEntry("password", hashedPassword),
                new HashEntry("role", user.Role)
            };
            if (user.Role == "user")
                hashEntries.Add(new HashEntry("digitalcurrency", 100000.00));
            await db.HashSetAsync(redisKey , hashEntries.ToArray());
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
    [HttpGet("GetSession/{sessionKey}")]
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
            RedisValue value = await db.StringGetAsync(redisKey);
            return Ok(value.ToString());
            
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPost("Logout/{sessionKey}")]
    public async Task<ActionResult> Logout(string sessionKey)
    {
        if(string.IsNullOrEmpty(sessionKey))
            return BadRequest("session key does not exist");
        var db = _redis.GetDatabase();
        var redisKey = $"session:{sessionKey}";
            if(await db.KeyExistsAsync(redisKey))
               await db.KeyDeleteAsync(redisKey);
        return Ok("Succesful logout");
    }
    [HttpGet("GetUser/{key}")]
    public async Task<ActionResult> GetUser(string key)
    {
        if (string.IsNullOrEmpty(key))
            return BadRequest("key does not exist");
        var db = _redis.GetDatabase();
        var redisKey = $"user:{key}";
        if(!await db.KeyExistsAsync(redisKey))
            return BadRequest("user does not exist");
        HashEntry[] fields = await db.HashGetAllAsync(redisKey);
        var fieldList = fields.ToDictionary(
                field => field.Name.ToString(),
                field => field.Value.ToString()
        );
        return Ok(fieldList);
    }


    [HttpGet("GetNotifications/{userKey}/{role}")]
    public async Task<ActionResult> GetNotification(string userKey , string role)
    {
        if (string.IsNullOrEmpty(userKey))
            return BadRequest("key does not exist");
        if(role != "user")
            return Unauthorized("Only users can get notifications");
        var db = _redis.GetDatabase();
        var subscriber = _redis.GetSubscriber();
        var redisKey = $"user:{userKey}";
        if(!await db.KeyExistsAsync(redisKey))
            return BadRequest("user does not exist");
        var tcs = new TaskCompletionSource<string>();
        await subscriber.SubscribeAsync(RedisChannel.Literal($"notification:{redisKey}"), (channel, message) =>
        {
            tcs.SetResult(message!);
        });

    
        var message = await Task.WhenAny(tcs.Task, Task.Delay(10000)); 

        if (message == tcs.Task)
        {
            return Ok(tcs.Task.Result);
        }
        else
        {
            
            return BadRequest("No message received within timeout.");
        }

    }

    [HttpPut("AddMoney")]
    public async Task<ActionResult> AddMoney([FromBody] PaypalPayment paypalPayment)
    {
        try
        {
            var db = _redis.GetDatabase();
            if (paypalPayment.Ammount < 0)
                return BadRequest("Ammount has to be greater than zero!");
            if(!await db.KeyExistsAsync(paypalPayment.User))
                return BadRequest("User does not exist");

            RedisValue currentCurrency = await db.HashGetAsync(paypalPayment.User , "digitalcurrency");
            double totalAmmount = Convert.ToDouble(currentCurrency);
            totalAmmount+=paypalPayment.Ammount;

            await db.HashSetAsync(paypalPayment.User , [
                new HashEntry("digitalcurrency" , totalAmmount)
            ]);

            return Ok($"{paypalPayment.User} now has {totalAmmount} ammount of money on their account");

        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

}
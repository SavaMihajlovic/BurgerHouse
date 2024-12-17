[ApiController]
[Route("[controller]")]
public class QueueUserController : ControllerBase
{
    private readonly IConnectionMultiplexer _redis;
    public QueueUserController(IConnectionMultiplexer redis )
    {
        _redis = redis;
    }
    [HttpPost("AddUser2Queue/{userKey}/{orderKey}")]
    public async Task<ActionResult> AddUser2Queue(int userKey , int orderKey)
    {
        try
        {
            var db = _redis.GetDatabase();
            string queueKey = $"user:{userKey.ToString()}order:{orderKey.ToString()}";
            db.ListRightPush("queue:orders" , queueKey);
            await db.KeyExpireAsync("queue:orders" , TimeSpan.FromSeconds(15));
            
            return Ok("Radi");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
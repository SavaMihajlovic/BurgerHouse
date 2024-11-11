
[ApiController]
[Route("[controller]")]
public class TestController : ControllerBase
{
    private readonly IConnectionMultiplexer _redis;

    public TestController(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    [HttpGet("Ping")]
    public IActionResult PingRedis()
    {
        try
        {
            var db = _redis.GetDatabase();
            var pingResult = db.Ping();
            return Ok($"Redis connection is successful: {pingResult.TotalMilliseconds} ms");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Redis connection failed: {ex.Message}");
        }
    }
}

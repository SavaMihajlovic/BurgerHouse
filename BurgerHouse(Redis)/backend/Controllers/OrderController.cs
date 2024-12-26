[ApiController]
[Route("[controller]")]
public class OrderController : ControllerBase
{
    private readonly IConnectionMultiplexer _redis;
    private readonly string _orderKey = "orderKey";
    public OrderController(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }
    [HttpPost("MakeOrder")]
    public async Task<ActionResult> MakeOrder([FromBody] Order order)
    {
        try
        {
            if(string.IsNullOrEmpty(order.UserID))
                return BadRequest("Order must have a user");
            var db = _redis.GetDatabase();

            if(!await db.KeyExistsAsync(order.UserID))
                return BadRequest("User must exist");

             if(order.Items.Count < 0 || order.Items.Any( x => x.Quantity < 1 || !db.KeyExists(x.ItemKey)))
                return BadRequest("Invalid order");

            var globalOrderKey = await db.StringIncrementAsync(_orderKey);
            string redisKey = $"order:{order.UserID}:{globalOrderKey}";
            if(await db.KeyExistsAsync(redisKey))
            {
                await db.StringDecrementAsync(_orderKey);
                return BadRequest("Key already exists!");
            }


            var hashEntries = new List<HashEntry>();
            double totalPrice = 0.0;

            foreach(var item in order.Items)
            {
                hashEntries.Add(new HashEntry(item.ItemKey , item.Quantity));
                RedisValue price = await db.HashGetAsync(item.ItemKey , "price");
                totalPrice += double.Parse(price.ToString());
            }
            hashEntries.Add(new HashEntry("createdAt" , order.CreatedAt.ToString()));

            RedisValue digitalcurrency = await db.HashGetAsync(order.UserID, "digitalcurrency");

            if(totalPrice > double.Parse(digitalcurrency.ToString()))
                return BadRequest("User does not have enough money");

            double newDigitalCurrency = double.Parse(digitalcurrency.ToString()) - totalPrice;
            await db.HashSetAsync(order.UserID , [new HashEntry("digitalcurrency", newDigitalCurrency.ToString())]);

            await db.HashSetAsync(redisKey , hashEntries.ToArray());

            await db.KeyExpireAsync(redisKey , TimeSpan.FromHours(24));

            string sortedSetKey = "sortedOrders";
            double unixTimestamp = ((DateTimeOffset)order.CreatedAt).ToUnixTimeSeconds();
            await db.SortedSetAddAsync(sortedSetKey , redisKey , unixTimestamp);


            return Ok("Order has been sucessfully payed for");

        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpGet("GetOrderFromUser/{userId}")]
    public async Task<ActionResult> GetOrderFromUser(string userId)
    {
        try
        {
            if(string.IsNullOrEmpty(userId))
                return BadRequest("Empty string for user");
            var db = _redis.GetDatabase();
            if(!await db.KeyExistsAsync(userId))
                return BadRequest("User does not exist");
            var pattern = $"order:{userId}:*";
            var keys = new List<String>();

            var redisKeys = db.Multiplexer.GetServer(_redis.GetEndPoints().First()).Keys(pattern: pattern);
            foreach (var key in redisKeys)
            keys.Add(key.ToString());
            
            
         
            var allOrders = new Dictionary<string , Dictionary<string , string>>();
            foreach (var key in keys)
            {
                HashEntry[] fields = await db.HashGetAllAsync(key);
                var fieldList = fields.ToDictionary(
                field => field.Name.ToString(),
                field => field.Value.ToString()
                );
                allOrders.Add(key , fieldList);
            }
            return Ok(allOrders);   
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpGet("GetOrder/{key}")]
    public async Task<ActionResult> GetOrder(string key)
    {
        try
        {
            if(string.IsNullOrEmpty(key))
                return BadRequest("key not found");
            if(!key.Contains("order:user:"))
                return BadRequest("invalid type of key");
            var db = _redis.GetDatabase();
            if(!await db.KeyExistsAsync(key))
                return NotFound("order does not exist");
            HashEntry[] fields = await db.HashGetAllAsync(key);
            var fieldList = fields.ToDictionary(
                field => field.Name.ToString(),
                field => field.Value.ToString()
            );
            return Ok(fieldList);

        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpGet("GetFirst10")]
    public async Task<ActionResult> GetFirst10()
    {
        try
        {
            var db = _redis.GetDatabase();
            string redisKey = "sortedOrders";
            var members = await db.SortedSetRangeByRankAsync(redisKey , 0 , 9);
            return Ok(members.Select(m => m.ToString()).ToArray());
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }



}

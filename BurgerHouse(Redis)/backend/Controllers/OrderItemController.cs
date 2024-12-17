[ApiController]
[Route("[controller]")]
public class OrderItemController : ControllerBase
{
    private readonly IConnectionMultiplexer _redis;

    public OrderItemController(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    [HttpPost("AddOrderItem")]
    public async Task<ActionResult> AddOrderItem([FromBody] OrderItem orderItem)
    {
        try
        {
            if(string.IsNullOrEmpty(orderItem.ItemKey))
                return BadRequest("You need to specify the item you want to order");

            if(orderItem.Quantity <= 0)
                return BadRequest("You have to put the quantity of the items you want to order");

            var db = _redis.GetDatabase();
            bool menuitemexists = await db.KeyExistsAsync(orderItem.ItemKey);

            if(!menuitemexists)
                return BadRequest("Requested item does not exist");
            
            string redisKey = $"order:{orderItem.ItemKey}:{orderItem.Quantity}";

            await db.HashSetAsync(redisKey, [
                new HashEntry("itemKey", orderItem.ItemKey), 
                new HashEntry("quantity", orderItem.Quantity)
            ]);

            await db.SetAddAsync("order:items", redisKey);
            return Ok($"Item succesfully ordered , redisKey={redisKey}.");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("ReadAllOrderedItems")]
    public async Task<ActionResult> ReadAllOrderedItems()
    {
        try
        {
           var db = _redis.GetDatabase();
            if(!await db.KeyExistsAsync("order:items"))
                return NotFound("Orders do not exist.");
            RedisValue[] members = await db.SetMembersAsync("order:items");
            var items = members.Select(member => member.ToString()).ToList();
            return Ok(items);
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpDelete("DeleteOrder/{key}")]
    public async Task<ActionResult> DeleteOrder(string key)
    {
        try
        {
            if(string.IsNullOrEmpty(key))
                return BadRequest("You need to specify the order key for the order you want to delete");
            if(!key.Contains("order:") || key.Contains("order:items"))
                return BadRequest("Key is not part of order items");
            var db = _redis.GetDatabase();
            var redisKey = key;
            if(!await db.KeyExistsAsync(redisKey))
                return NotFound("Order does not exist");
            if(await db.SetContainsAsync("order:items" , redisKey))
                await db.SetRemoveAsync("order:items" , redisKey);
            await db.KeyDeleteAsync(redisKey);
            return Ok($"Order is succesfully deleted, redisKey={redisKey}" );
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("ReadOrder/{key}")]
    public async Task<ActionResult> ReadOrder(string key)
    {
        try
        {   
            
            if(string.IsNullOrEmpty(key))
                return BadRequest("You need to specify the key of the order");
            var db = _redis.GetDatabase();
            var redisKey = key;
            if(!await db.KeyExistsAsync(redisKey))
                return NotFound("Order does not exist");
            HashEntry[] fields = await db.HashGetAllAsync(redisKey);
            var fieldList = fields.ToDictionary(
                field => field.Name.ToString(),
                field => field.Value.ToString()
            );
            return Ok(fieldList);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPut("UpdateOrder")]
    public async Task<ActionResult> UpdateOrder([FromBody] OrderItem orderItem)
    {
        try
        {   
            if(string.IsNullOrEmpty(orderItem.ItemKey))
                return BadRequest("You need to specify the key of the order that you want to update");

            if(orderItem.Quantity <= 0)
                return BadRequest("Quantity can't be less or equal to 0");

            var db = _redis.GetDatabase();
            var redisKey = orderItem.ItemKey;
            if(!await db.KeyExistsAsync(redisKey))
                return NotFound("Order does not exist.");
            await db.HashSetAsync(redisKey , [
                new HashEntry("quantity" , orderItem.Quantity)
            ]);
            return Ok($"Order is updated redisKey={redisKey}.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
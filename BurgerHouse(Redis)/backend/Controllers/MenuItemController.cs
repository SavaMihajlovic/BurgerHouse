[ApiController]
[Route("[controller]")]
public class MenuItemController : ControllerBase
{
    private readonly IConnectionMultiplexer _redis;

    public MenuItemController(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }
    [HttpPost("AddBurger")]
    public async Task<ActionResult> AddBurger([FromBody] MenuItem menuItem)
    {
        try
        {
            if(string.IsNullOrEmpty(menuItem.Name))
                return BadRequest("Item has to have a name.");
            if(string.IsNullOrEmpty(menuItem.Description))
                return BadRequest("Item has to have a description.");
            if(menuItem.Price <= 0)
                return BadRequest("Item price needs to be greater than zero.");
            var db = _redis.GetDatabase();
            string redisKey = $"menu:burger:{menuItem.Name.ToLower().Replace(" " , "")}";
            if(await db.KeyExistsAsync(redisKey))
                return BadRequest($"Item with name:{menuItem.Name} already exists.");
            await db.HashSetAsync(redisKey , 
            [
                new HashEntry("name", menuItem.Name),
                new HashEntry("price",menuItem.Price),
                new HashEntry("description", menuItem.Description)
            ]);
            await db.SetAddAsync("menu:items" , redisKey);
            return Ok($"Item is succesfully added to menu , redisKey={redisKey}.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPost("AddFries")]
    public async Task<ActionResult> AddFries([FromBody] MenuItem menuItem)
    {
        try
        {
            if(string.IsNullOrEmpty(menuItem.Name))
                return BadRequest("Item has to have a name.");
            if(string.IsNullOrEmpty(menuItem.Description))
                return BadRequest("Item has to have a description.");
            if(menuItem.Price <= 0)
                return BadRequest("Item price needs to be greater than zero.");
            var db = _redis.GetDatabase();
            string redisKey = $"menu:fries:{menuItem.Name.ToLower().Replace(" " , "")}";
            if(await db.KeyExistsAsync(redisKey))
                return BadRequest($"Item with name:{menuItem.Name} already exists.");
            await db.HashSetAsync(redisKey , 
            [
                new HashEntry("name", menuItem.Name),
                new HashEntry("price",menuItem.Price),
                new HashEntry("description", menuItem.Description)
            ]);
            await db.SetAddAsync("menu:items" , redisKey);
            return Ok($"Item is succesfully added to menu , redisKey={redisKey}.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpDelete("DeleteItem")]
    public async Task<ActionResult> DeleteItem(string name)
    {
        try
        {
            if(string.IsNullOrEmpty(name))
                return BadRequest("Name of an item is needed.");
            var db = _redis.GetDatabase();
            var redisKey = $"menu:{name.ToLower().Replace(" " , "")}";
            if(!await db.KeyExistsAsync(redisKey))
                return NotFound("Item does not exist");
            if(await db.SetContainsAsync("menu:items" , redisKey))
                await db.SetRemoveAsync("menu:items" , redisKey);
            await db.KeyDeleteAsync(redisKey);
            return Ok($"Item is succesfully deleted from menu , redisKey={redisKey}" );
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpGet("ReadItem")]
    public async Task<ActionResult> ReadItem(string name)
    {
        try
        {
            if(string.IsNullOrEmpty(name))
                return BadRequest("Name of an item is needed.");
            var db = _redis.GetDatabase();
            var redisKey = $"menu:{name.ToLower().Replace(" " , "")}";
            if(!await db.KeyExistsAsync(redisKey))
                return NotFound("Item does not exist");
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
    [HttpGet("ReadAllItems")]
    public async Task<ActionResult> ReadAllItems()
    {
        try
        {
            var db = _redis.GetDatabase();
            if(!await db.KeyExistsAsync("menu:items"))
                return NotFound("Items do not exist.");
            RedisValue[] members = await db.SetMembersAsync("menu:items");
            var items = members.Select(member => member.ToString()).ToList();
            return Ok(items);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("ReadAllBurgers")]
    public async Task<ActionResult> ReadAllBurgers()
    {
        try
        {
            var db = _redis.GetDatabase();
            if(!await db.KeyExistsAsync("menu:items"))
                return NotFound("Items do not exist.");
            RedisValue[] members = await db.SetMembersAsync("menu:items");
            var items = members.Select(member => member.ToString()).Where(member => member.StartsWith("menu:burger:")).ToList();
            return Ok(items);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
     [HttpGet("ReadAllFries")]
    public async Task<ActionResult> ReadAllFries()
    {
        try
        {
            var db = _redis.GetDatabase();
            if(!await db.KeyExistsAsync("menu:items"))
                return NotFound("Items do not exist.");
            RedisValue[] members = await db.SetMembersAsync("menu:items");
            var items = members.Select(member => member.ToString()).Where(member => member.StartsWith("menu:fries:")).ToList();
            return Ok(items);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpPut("UpdateItem")]
    public async Task<ActionResult> UpdateItem([FromBody] MenuItem menuItem )
    {
        try
        {
            if(string.IsNullOrEmpty(menuItem.Name))
                return BadRequest("Item has to have a name.");
            if(string.IsNullOrEmpty(menuItem.Description))
                return BadRequest("Item has to have a description.");
            if(menuItem.Price <= 0)
                return BadRequest("Item price needs to be greater than zero.");
            var db = _redis.GetDatabase();
            var redisKey = $"menu:{menuItem.Name.ToLower().Replace(" " , "")}";
            if(!await db.KeyExistsAsync(redisKey))
                return NotFound("Items do not exist.");
            await db.HashSetAsync(redisKey , [
                new HashEntry("price" , menuItem.Price),
                new HashEntry("description" , menuItem.Description)
            ]);
            return Ok($"Item is updated redisKey={redisKey}.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
[ApiController]
[Route("[controller]")]
public class MenuItemController : ControllerBase
{
    private readonly IConnectionMultiplexer _redis;

    public MenuItemController(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }
    [HttpPost("AddItem/{type}")]
    public async Task<ActionResult> AddItem([FromForm] MenuItem menuItem , string type , IFormFile image)
    {
        try
        {
            if(image == null || image.Length == 0)
            {
                return BadRequest("Image not found");
            }
            byte[] fileBytes;
            using (var stream = image.OpenReadStream())
            {
                fileBytes = new byte[image.Length];
                await stream.ReadAsync(fileBytes, 0, (int)image.Length);
            }
            string base64Image = Convert.ToBase64String(fileBytes);

            if (type != "burger" && type != "fries" && type != "drinks")
                return BadRequest("Type must be burger|fries|drinks");
            if(string.IsNullOrEmpty(menuItem.Name))
                return BadRequest("Item has to have a name.");
            if(string.IsNullOrEmpty(menuItem.Description))
                return BadRequest("Item has to have a description.");
            if(menuItem.Price <= 0)
                return BadRequest("Item price needs to be greater than zero.");
            var db = _redis.GetDatabase();
            string redisKey = $"menu:{type}:{menuItem.Name.ToLower().Replace(" " , "")}";
            if(await db.KeyExistsAsync(redisKey))
                return BadRequest($"Item with name:{menuItem.Name} already exists.");
            var contentType = "image/jpeg";
            await db.HashSetAsync(redisKey , 
            [
                new HashEntry("name", menuItem.Name),
                new HashEntry("price",menuItem.Price),
                new HashEntry("description", menuItem.Description),
                new HashEntry("image" , $"data:{contentType};base64,{base64Image}"),
            ]);
            await db.SetAddAsync("menu:items" , redisKey);
            return Ok($"Item is succesfully added to menu , redisKey={redisKey}.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpDelete("DeleteItem/{key}")]
    public async Task<ActionResult> DeleteItem(string key)
    {
        try
        {
            if(string.IsNullOrEmpty(key))
                return BadRequest("Name of an item is needed.");
            if(!key.Contains("menu:") || key.Contains("menu:items"))
                return BadRequest("Key is not part of menu items");
            var db = _redis.GetDatabase();
            var redisKey = key;
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
    [HttpGet("ReadItem/{key}")]
    public async Task<ActionResult> ReadItem(string key)
    {
        try
        {   
            
            if(string.IsNullOrEmpty(key))
                return BadRequest("Name of an item is needed.");
            var db = _redis.GetDatabase();
            var redisKey = key;
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

    [HttpGet("ReadAllSpecific/{type}")]
    public async Task<ActionResult> ReadAllSpecific(string type)
    {
        try
        {   
            if (type != "burger" && type != "fries" && type != "drinks")
                return BadRequest("Type must be burger|fries|drinks");
            var db = _redis.GetDatabase();
            if(!await db.KeyExistsAsync("menu:items"))
                return NotFound("Items do not exist.");
            RedisValue[] members = await db.SetMembersAsync("menu:items");
            var items = members.Select(member => member.ToString()).Where(member => member.StartsWith($"menu:{type}:")).ToList();
            var burgerNames = items.Select(async key => new { Key = key, Name = (await db.HashGetAsync(key, "name")).ToString() }).ToList();
            var names = await Task.WhenAll(burgerNames);
            return Ok(names);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    


    [HttpPut("UpdateItem/{key}")]
    public async Task<ActionResult> UpdateItem([FromForm] MenuItem menuItem , string key , IFormFile image)
    {
        try
        {
            if(image == null || image.Length == 0)
            {
                return BadRequest("Image not found");
            }
            byte[] fileBytes;
            using (var stream = image.OpenReadStream())
            {
                fileBytes = new byte[image.Length];
                await stream.ReadAsync(fileBytes, 0, (int)image.Length);
            }
            string base64Image = Convert.ToBase64String(fileBytes);

            if(string.IsNullOrEmpty(menuItem.Name))
                return BadRequest("Item has to have a name.");
            if(string.IsNullOrEmpty(menuItem.Description))
                return BadRequest("Item has to have a description.");
            if(menuItem.Price <= 0)
                return BadRequest("Item price needs to be greater than zero.");
            var db = _redis.GetDatabase();
            var redisKey = key;
            if(!await db.KeyExistsAsync(redisKey))
                return NotFound("Items do not exist.");
            var contentType = "image/jpeg";
            await db.HashSetAsync(redisKey , [
                new HashEntry("price" , menuItem.Price),
                new HashEntry("description" , menuItem.Description),
                new HashEntry("image" , $"data:{contentType};base64,{base64Image}")
            ]);
            return Ok($"Item is updated redisKey={redisKey}.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPut("UpdateItemImage/{key}")]
    public async Task<ActionResult> UpdateItemImage(string key ,IFormFile image)
    {
        try
        {
            if (string.IsNullOrEmpty(key))
                return BadRequest("No item key");
            if(image == null || image.Length == 0)
            {
                return BadRequest("Image not found");
            }
            byte[] fileBytes;
            using (var stream = image.OpenReadStream())
            {
                fileBytes = new byte[image.Length];
                await stream.ReadAsync(fileBytes, 0, (int)image.Length);
            }
            string base64Image = Convert.ToBase64String(fileBytes);
             var db = _redis.GetDatabase();
            var redisKey = key;
            if(!await db.KeyExistsAsync(redisKey))
                return NotFound("Items do not exist.");
            var contentType = "image/jpeg";
            await db.HashSetAsync(redisKey , [
                new HashEntry("image" , $"data:{contentType};base64,{base64Image}")
            ]);
            return Ok($"Item is updated redisKey={redisKey}.");
           
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
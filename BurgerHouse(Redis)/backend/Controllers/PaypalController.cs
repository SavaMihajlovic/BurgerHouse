using System.Web;


[ApiController]
[Route("[controller]")]
public class PaypalController : ControllerBase
{
    private readonly IConnectionMultiplexer _redis;

    private readonly IConfiguration _configuration;

    private readonly HttpClient _httpClient;

    public PaypalController(IConnectionMultiplexer redis , IConfiguration configuration )
    {
        _configuration = configuration;
        _redis = redis;
        _httpClient = new HttpClient();
    }

    [HttpPost("MakePayment")]
    public async Task<ActionResult> MakePayment([FromBody] PaypalPayment paypalPayment)
    {
        try
        {
            if(paypalPayment.Ammount < 10)
                return BadRequest("Invalid ammount");
            var db = _redis.GetDatabase();
            if(!await db.KeyExistsAsync(paypalPayment.User))
                return BadRequest("User does not exist");
            string ClientId = _configuration.GetSection("PaypalOptions:ClientID").Value!;
            string Secret = _configuration.GetSection("PaypalOptions:ClientSecret").Value!;
            string Mode = _configuration.GetSection("PaypalOptions:ClientMode").Value!;
            string successUrl = $"http://localhost:5173/payment-success?user={paypalPayment.User}&ammount={paypalPayment.Ammount}";
            PayPalEnvironment environment = Mode == "sandbox" ? new SandboxEnvironment(ClientId , Secret) : new LiveEnvironment(ClientId,Secret);
            var client = new PayPalHttpClient(environment);

        
            var order = new OrderRequest()
            {
                CheckoutPaymentIntent = "CAPTURE",
                ApplicationContext = new ApplicationContext()
                {
                    BrandName = "BURGER_HOUSE",
                    LandingPage = "LOGIN",
                    UserAction = "PAY_NOW",
                    ReturnUrl = successUrl,
                    CancelUrl = "http://localhost:5173/payment-failure?"
                },
                PurchaseUnits = new List<PurchaseUnitRequest>()
                {
                    new PurchaseUnitRequest()
                    {
                        AmountWithBreakdown = new AmountWithBreakdown()
                        {
                            CurrencyCode = "EUR",
                            Value = paypalPayment.Ammount.ToString()
                        }
                    }
                }
            };
            var request = new OrdersCreateRequest();
            request.Prefer("return=representation");
            request.RequestBody(order);
            var response = await client.Execute(request);
            var statusCode = response.StatusCode;

            if (statusCode == HttpStatusCode.Created)
            {
                var result = response.Result<PayPalCheckoutSdk.Orders.Order>();
                var approvalUrl = result.Links.First(link => link.Rel == "approve").Href;
                return Ok(approvalUrl);
            }
            else
            {
                return StatusCode((int)statusCode, "Order not succesful");
            }
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
     }

    [HttpPost("ConfirmOrder/{token}")]
    public async Task<ActionResult> ConfirmOrder(string token)
    {
        try
        {
            string Mode = _configuration.GetSection("PaypalOptions:ClientMode").Value!;
            string accessToken = await GetAccessToken();
            var requestData = new {
                token = accessToken
            };
            string jsonObject = JsonConvert.SerializeObject(requestData);

            HttpRequestMessage request = Mode == "sandbox" ? new HttpRequestMessage(HttpMethod.Post, $"https://api.sandbox.paypal.com/v2/checkout/orders/{token}/capture") : new HttpRequestMessage(HttpMethod.Post, $"https://api.paypal.com/v2/checkout/orders/{token}/capture");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Content = new StringContent(jsonObject, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();


            if (response.IsSuccessStatusCode)
                return Ok("Payment succesful!");
            else
                return BadRequest($"Payment is not sucessful! Response: {content}");
        }
        catch (Exception ex)
        {
            return BadRequest($"Payment is not succesful! Error:{ex.Message}");
        }
    }


    private async Task<string> GetAccessToken()
    {
        string ClientId = _configuration.GetSection("PaypalOptions:ClientID").Value!;
        string Secret = _configuration.GetSection("PaypalOptions:ClientSecret").Value!;
        string Mode = _configuration.GetSection("PaypalOptions:ClientMode").Value!;
        string credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{ClientId}:{Secret}"));

        HttpRequestMessage request = Mode == "sandbox" ? new HttpRequestMessage(HttpMethod.Post, "https://api-m.sandbox.paypal.com/v1/oauth2/token") : new HttpRequestMessage(HttpMethod.Post, "https://api-m.paypal.com/v1/oauth2/token");
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
        request.Content = new StringContent("grant_type=client_credentials", Encoding.UTF8, "application/x-www-form-urlencoded");

        var response = await _httpClient.SendAsync(request);
        if (response.IsSuccessStatusCode)
        {
            var json = await response.Content.ReadAsStringAsync();
            dynamic data = JsonConvert.DeserializeObject(json)!;
            return data.access_token;
        }
        else
            throw new Exception("Getting token from Paypal api was not succesful");
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using SalesTeamWebApp.Helpers;
using System.Threading.Tasks;

namespace SalesTeamWebApp.Controllers
{
  public class EssentialsController : Controller
  {
    private readonly IConfiguration _configuration;

    private static string _subscriptionKey;
    private static string _searchEndpoint;

    public EssentialsController(IConfiguration configuration)
    {
      _configuration = configuration;
      _subscriptionKey = _configuration["Keys:EssentialsKey"];
      _searchEndpoint = _configuration["Endpoints:SearchEndpoint"];
    }

    public ActionResult Index()
    {
      ViewBag.API = "Summary and Charity Check";
      return View();
    }

    public ActionResult Test()
    {
      return View();
    }

    [HttpPost]
    public async Task<string> Index(string request)
    {
      return await APIClient.PostJson(_searchEndpoint, _subscriptionKey, request);
    }
  }
}
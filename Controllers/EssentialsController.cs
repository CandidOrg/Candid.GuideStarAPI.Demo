using Candid.GuideStarAPI;
using Candid.GuideStarAPI.Resources;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
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
    [ValidateAntiForgeryToken]
    public async Task<string> Index(SearchPayload request)
    {
      GuideStarClient.Init(_subscriptionKey);

      return await EssentialsResource.GetOrganizationAsync(request);
    }
  }
}
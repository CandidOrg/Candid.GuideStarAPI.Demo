using System.Threading.Tasks;
using Candid.GuideStarAPI;
using Candid.GuideStarAPI.Resources;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace SalesTeamWebApp.Controllers
{
  public class EssentialsController : Controller
  {
    private readonly IConfiguration _configuration;

    private static string _subscriptionKey;

    public EssentialsController(IConfiguration configuration)
    {
      _configuration = configuration;
      _subscriptionKey = _configuration["Keys:EssentialsKey"];

      if (!string.IsNullOrEmpty(_subscriptionKey) && !GuideStarClient.SubscriptionKeys.TryGetValue(Domain.EssentialsV2, out var _))
        GuideStarClient.SubscriptionKeys.Add(Domain.EssentialsV2, _subscriptionKey);
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
      return await EssentialsResource.GetOrganizationAsync(request);
    }
  }
}
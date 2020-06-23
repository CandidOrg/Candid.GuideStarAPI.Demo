using Candid.GuideStarAPI;
using Candid.GuideStarAPI.Resources;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;

namespace SalesTeamWebApp.Controllers
{
  [Route("Premier")]
  public class PremierController : Controller
  {
    private readonly IConfiguration _configuration;

    private static string _subscriptionKey;
    private static string _profileEndpoint;

    public PremierController(IConfiguration configuration)
    {
      _configuration = configuration;
      _subscriptionKey = _configuration["Keys:PremierKey"];
      }

    [Route("")]
    public ActionResult Index()
    {
      ViewBag.API = "Premier";
      return View();
    }

    [Route("{orgId}")]
    public ActionResult Index(string orgId)
    {
      ViewBag.API = "Profile";
      ViewBag.Id = orgId;
      return View();
    }



    [HttpGet]
    [Route("get")]
    public async Task<string> Get(string ein)
    {
      GuideStarClient.Init(_subscriptionKey);
      
      return await PremierResource.GetOrganizationAsync(ein);
    }

    [Route("GetFinTable")]
    public ActionResult GetBalanceSheet(string orgData, string type)
    {
      JObject j = JObject.Parse(orgData);
      return type switch
      {
        "9" => PartialView("_f990BalanceSheet", j),
        "z" => PartialView("_EZBalanceSheet", j),
        "f" => PartialView("_PFBalanceSheet", j),
        _ => new EmptyResult(),
      };
    }
  }
}
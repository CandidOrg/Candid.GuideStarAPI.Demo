using Candid.GuideStarAPI;
using Candid.GuideStarAPI.Resources;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Configuration;
using SalesTeamWebApp.Helpers;
using System.Threading.Tasks;

namespace SalesTeamWebApp.Controllers
{
  [Route("CharityCheck")]
  public class CharityCheckController : Controller
  {
    // requires using Microsoft.Extensions.Configuration;
    private readonly IConfiguration _configuration;

    private static string _subscriptionKey;
    private static string _pdfKey;
    private static string _charityCheckPdfEndpoint;

    public CharityCheckController(IConfiguration configuration)
    {
      _configuration = configuration;
      _subscriptionKey = _configuration["Keys:CharityCheckKey"];
      _pdfKey = _configuration["Keys:CharityCheckPDFKey"];
      _charityCheckPdfEndpoint = _configuration["Endpoints:CharityCheckPDFEndpoint"];
    }

    [Route("")]
    public ActionResult Index()
    {
      ViewBag.API = "Charity Check";
      return View();
    }

    [Route("check")]
    [HttpGet]
    public async Task<string> Check(string ein)
    {
      GuideStarClient.Init(_subscriptionKey);

      return await CharityCheckResource.GetOrganizationAsync(ein);
    }

    [Route("pdf/{ein}")]
    [HttpGet]
    public async Task<ActionResult> Pdf(string ein)
    {
      // will be updated when endpoints for pdfs are added to sdk
      var response = await APIClient.Get(_charityCheckPdfEndpoint, ein, _pdfKey);

      if (response.IsSuccessStatusCode)
      {
        var fileName = $"{ein}_charity_check.pdf";
        var content = response.Content;
        var contentStream = await content.ReadAsStreamAsync();

        var provider = new FileExtensionContentTypeProvider();

        if (!provider.TryGetContentType(fileName, out string fileType))
        {
          fileType = "application/octet-stream";
        }

        return File(contentStream, fileType, fileName);
      }

      return new NotFoundResult();
    }
  }
}

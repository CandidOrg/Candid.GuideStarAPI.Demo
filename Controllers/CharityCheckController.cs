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
    private static string _charityCheckEndpoint;
    private static string _charityCheckPdfEndpoint;

    public CharityCheckController (IConfiguration configuration){
      _configuration = configuration;
      _subscriptionKey = _configuration["Keys:CharityCheckKey"];
      _pdfKey =  _configuration["Keys:CharityCheckPDFKey"];
      _charityCheckEndpoint = _configuration["Endpoints:CharityCheckEndpoint"];
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
      return await APIClient.GetJson(_charityCheckEndpoint, ein, _subscriptionKey);
    }

    [Route("pdf/{ein}")]
    [HttpGet]
    public async Task<ActionResult> Pdf(string ein)
    {
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

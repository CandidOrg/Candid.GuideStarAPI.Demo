using Microsoft.AspNetCore.Mvc;

namespace API_Test.Controllers
{
  public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}



using Newtonsoft.Json;
using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace SalesTeamWebApp.Helpers
{
  public static class APIClient
  {
    // We store our subscription key and base url in the Web.config
    private const string BASEURI = "https://apidata.guidestar.org";

    // Init a static HttpClient with our base url to make calls with
    public static HttpClient client = new HttpClient
    {
      BaseAddress = new Uri(BASEURI)
    };

    // Using generics to do GET calls and return JSON deserialized as a model
    public static async Task<HttpResponseMessage> Get(string endpoint, string ein, string subscriptionKey)
    {
      // Add required header, the subscription key
      if (client.DefaultRequestHeaders.Contains("Subscription-key"))
      {
        client.DefaultRequestHeaders.Remove("Subscription-key");
      }
      client.DefaultRequestHeaders.Add("Subscription-key", subscriptionKey);

      // Make the request
      ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
      return await client.GetAsync($"{endpoint}{ein}");
    }
  }
}



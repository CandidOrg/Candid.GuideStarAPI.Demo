using Newtonsoft.Json;
using System;
using System.Collections.Generic;
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

    public static async Task<T> Post<T>(string endpoint, string subscriptionKey, object request)
    {
      if (client.DefaultRequestHeaders.Contains("Subscription-key"))
      {
        client.DefaultRequestHeaders.Remove("Subscription-key");
      }
      client.DefaultRequestHeaders.Add("Subscription-key", subscriptionKey);

      var jsonRequest = JsonConvert.SerializeObject(request);
      var stringContent = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

      ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

      var response = await client.PostAsync(endpoint, stringContent);
      var responseAsJson = await response.Content.ReadAsStringAsync();

      var responseAsModel = JsonConvert.DeserializeObject<T>(responseAsJson);

      return responseAsModel;
    }

    // If we want just the JSON string, we'll use this request and skip the deserialization process
    public static async Task<String> GetJson(string endpoint, string ein, string subscriptionKey)
    {
      if (client.DefaultRequestHeaders.Contains("Subscription-key"))
      {
        client.DefaultRequestHeaders.Remove("Subscription-key");
      }
      client.DefaultRequestHeaders.Add("Subscription-key", subscriptionKey);

      ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

      var response = await client.GetAsync($"{endpoint}{ein}");
      var responseAsJson = await response.Content.ReadAsStringAsync();

      return responseAsJson;
    }

    public static async Task<string> PostJson(string endpoint, string subscriptionKey, string request)
    {
      if (client.DefaultRequestHeaders.Contains("Subscription-key"))
      {
        client.DefaultRequestHeaders.Remove("Subscription-key");
      }
      client.DefaultRequestHeaders.Add("Subscription-key", subscriptionKey);

      var stringContent = new StringContent(request, Encoding.UTF8, "application/json");

      ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

      var response = await client.PostAsync(endpoint, stringContent);
      var responseAsJson = await response.Content.ReadAsStringAsync();

      return responseAsJson;
    }
  }
}



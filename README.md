# API Demo Core
Example project written in .Net Core using Candid.GuideStarAPI NuGet package

## Managing API Keys
- API keys are stored and retrieved using the [Microsoft Secrets Manager tool](https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets?view=aspnetcore-3.1&tabs=windows)
  - Sample secrets.json
  ```json
    {
      "Keys:CharityCheckKey": "KEY",
      "Keys:CharityCheckPDFKey": "KEY",
      "Keys:EssentialsKey": "KEY",
      "Keys:PremierKey": "KEY"
    }
    ```

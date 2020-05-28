# API Demo Core
Example project using Candid. API Library nuget package.  Written in .Net Core.

## Managing API Keys
- Api keys are stored and retrieved using the [Microsoft Secrets Manager tool](https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets?view=aspnetcore-3.1&tabs=windows)
  - Sample secrets.json
  ```json
    {
      "Keys:CharityCheckKey": "KEY",
      "Keys:CharityCheckPDFKey": "KEY",
      "Keys:EssentialsKey": "KEY",
      "Keys:PremierKey": "KEY"
    }
    ```

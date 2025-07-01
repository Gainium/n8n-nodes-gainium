import {
  ICredentialType,
  NodePropertyTypes,
  ICredentialTestRequest,
} from "n8n-workflow"

export class GainiumApi implements ICredentialType {
  name = "gainiumApi"
  displayName = "Gainium API"
  properties = [
    {
      displayName: "Base URL",
      name: "base_url",
      type: "string" as NodePropertyTypes,
      default: "https://api.gainium.io",
      description:
        "Base URL for Gainium API. You can get it from https://app.gainium.io/",
    },
    {
      displayName: "Key",
      name: "token",
      type: "password" as NodePropertyTypes,
      default: "",
      description:
        "You can get token and secret for Gainium API from https://app.gainium.io/",
    },
    {
      displayName: "Secret",
      name: "secret",
      type: "password" as NodePropertyTypes,
      default: "",
      description:
        "You can get token and secret for Gainium API from https://app.gainium.io/",
    },
  ]

  // Credential test - required for n8n community nodes
  test: ICredentialTestRequest = {
    request: {
      baseURL: "={{$credentials.base_url}}",
      url: "/user",
      method: "GET",
      headers: {
        "X-API-KEY": "={{$credentials.token}}",
        "X-API-SECRET": "={{$credentials.secret}}",
      },
    },
  }
}

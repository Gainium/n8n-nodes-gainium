import { ICredentialType, NodePropertyTypes } from "n8n-workflow";

export class GainiumApi implements ICredentialType {
  name = "gainiumApi";
  displayName = "Gainium API";
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
      displayName: "Token",
      name: "token",
      type: "string" as NodePropertyTypes,
      default: "",
      description:
        "You can get token and secret for Gainium API from https://app.gainium.io/",
    },
    {
      displayName: "Secret",
      name: "secret",
      type: "string" as NodePropertyTypes,
      default: "",
      description:
        "You can get token and secret for Gainium API from https://app.gainium.io/",
    },
  ];
}

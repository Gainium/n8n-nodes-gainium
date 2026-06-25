import { createHmac } from "crypto"
import {
  IAuthenticate,
  ICredentialDataDecryptedObject,
  ICredentialType,
  IHttpRequestOptions,
  NodePropertyTypes,
} from "n8n-workflow"

const DEFAULT_BASE_URL = "https://api.gainium.io"

/**
 * Gainium signs every request as HMAC-SHA256 of `body + METHOD + path(+query) + timestamp`,
 * sent in the Token/Time/Signature headers. This is per-request signing, so it can't be
 * expressed as a static `IAuthenticateGeneric`; n8n's function form of `authenticate` lets us
 * compute the signature from the outgoing request and inject the headers. Both the V1 and V2
 * nodes route their calls through `httpRequestWithAuthentication`, so this is the single place
 * auth is applied.
 */
const authenticate: IAuthenticate = async(
  credentials: ICredentialDataDecryptedObject,
  requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> => {
  const secret = (credentials.secret as string) || ""
  const token = (credentials.token as string) || ""
  const baseUrl = (
    (credentials.base_url as string) || DEFAULT_BASE_URL
  ).replace(/\/+$/, "")

  // The signature covers the path+query only (no scheme/host). Nodes may pass either an
  // absolute URL (V1) or a path relative to the credential's base URL (V2).
  const rawUrl = (requestOptions.url as string) || ""
  let pathWithQuery: string
  if (/^https?:\/\//i.test(rawUrl)) {
    const parsed = new URL(rawUrl)
    pathWithQuery = parsed.pathname + parsed.search
  } else {
    pathWithQuery = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`
    requestOptions.url = `${baseUrl}${pathWithQuery}`
  }

  const method = (requestOptions.method || "GET").toString().toUpperCase()

  const { body } = requestOptions
  const bodyString =
    body === undefined || body === null || body === ""
      ? ""
      : typeof body === "string"
        ? body
        : JSON.stringify(body)

  const timestamp = Date.now()
  const signature = createHmac("sha256", secret)
    .update(bodyString + method + pathWithQuery + timestamp)
    .digest("base64")

  requestOptions.headers = {
    ...requestOptions.headers,
    Token: token,
    Time: timestamp,
    Signature: signature,
  }

  return requestOptions
}

export class GainiumApi implements ICredentialType {
  name = "gainiumApi"
  displayName = "Gainium API"
  authenticate = authenticate
  properties = [
    {
      displayName: "Base URL",
      name: "base_url",
      type: "string" as NodePropertyTypes,
      default: DEFAULT_BASE_URL,
      description:
        "Base URL for Gainium API. You can get it from https://app.gainium.io/",
    },
    {
      displayName: "Key",
      name: "token",
      type: "string" as NodePropertyTypes,
      typeOptions: {
        password: true,
      },
      default: "",
      description:
        "You can get token and secret for Gainium API from https://app.gainium.io/",
    },
    {
      displayName: "Secret",
      name: "secret",
      type: "string" as NodePropertyTypes,
      typeOptions: {
        password: true,
      },
      default: "",
      description:
        "You can get token and secret for Gainium API from https://app.gainium.io/",
    },
  ]
}

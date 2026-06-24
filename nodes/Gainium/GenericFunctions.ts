import {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
} from "n8n-workflow"

/**
 * HMAC SHA256 using the Web Crypto API (works in Node.js and browsers without
 * pulling in the `crypto` module — matches the V1 implementation).
 */
async function createHmacSha256(
  secret: string,
  message: string,
): Promise<string> {
  const encoder = new TextEncoder()
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(message),
  )
  const bytes = new Uint8Array(signature)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Gainium signs requests as HMAC-SHA256 of `body + METHOD + path(+query) + timestamp`.
 * Identical scheme to the V1 node and the Make.com app.
 */
async function getSignature(
  secret: string,
  body: string,
  method: string,
  pathWithQuery: string,
  timestamp: number,
): Promise<string> {
  return createHmacSha256(secret, body + method + pathWithQuery + timestamp)
}

/**
 * Build a query string from a record, skipping null/undefined/empty values.
 * Returns "" or "?a=1&b=2".
 */
export function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") {continue}
    search.append(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}

/**
 * Make a single signed request against the Gainium V2 API.
 * @param pathWithQuery e.g. "/api/v2/bots/dca?fields=standard&page=1"
 */
export async function gainiumApiRequest(
  this: IExecuteFunctions,
  method: IHttpRequestMethods,
  pathWithQuery: string,
  body?: IDataObject,
  paperContext = false,
): Promise<IDataObject> {
  const credentials = await this.getCredentials("gainiumApi")
  const baseUrl = (credentials.base_url as string) || "https://api.gainium.io"
  const token = credentials.token as string
  const secret = credentials.secret as string

  const timestamp = Date.now()
  const bodyString = body ? JSON.stringify(body) : ""
  const signature = await getSignature(
    secret,
    bodyString,
    method,
    pathWithQuery,
    timestamp,
  )

  const options: IHttpRequestOptions = {
    url: `${baseUrl}${pathWithQuery}`,
    method,
    headers: {
      "Content-Type": "application/json",
      Token: token,
      Time: timestamp,
      Signature: signature,
      // V2 selects the paper vs live account from this header (not the signature)
      "paper-context": paperContext ? "true" : "false",
    },
    json: true,
  }
  if (body) {
    options.body = body
  }

  const response = (await this.helpers.httpRequest(options)) as IDataObject

  if (
    response &&
    (response.status === "NOTOK" || response.status === "error")
  ) {
    const reason = response.reason as IDataObject | string | undefined
    const message =
      (reason && typeof reason === "object" && (reason.message as string)) ||
      (typeof reason === "string" ? reason : "") ||
      "Gainium API request failed"
    throw new Error(message)
  }

  return response
}

/**
 * Fetch every page of a V2 list endpoint. V2 list responses are shaped
 * `{ data: [...], meta: { page, total } }` and pages are 1-indexed.
 * @param buildPath function that returns the full path+query for a given page
 */
export async function gainiumApiRequestAllItems(
  this: IExecuteFunctions,
  buildPath: (page: number) => string,
  paperContext = false,
): Promise<IDataObject[]> {
  const items: IDataObject[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const response = await gainiumApiRequest.call(
      this,
      "GET",
      buildPath(page),
      undefined,
      paperContext,
    )
    const data = (response.data as IDataObject[]) || []
    items.push(...data)

    const meta = response.meta as IDataObject | undefined
    const currentPage = meta ? Number(meta.page) : page
    const totalPages = meta ? Number(meta.total) : page
    if (meta && currentPage < totalPages) {
      page = currentPage + 1
    } else {
      hasMore = false
    }
  }

  return items
}

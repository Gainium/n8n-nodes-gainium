import {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from "n8n-workflow"

import {
  ADD_FUNDS_TO_DEAL,
  ARCHIVE_BOT,
  CHANGE_BOT_PAIRS,
  CLONE_DCA_BOT,
  CLONE_COMBO_BOT,
  CLOSE_DEAL,
  GET_CRYPTO_SCREENER,
  GET_SUPPORTED_EXCHANGE,
  GET_USER_COMBO_BOTS,
  GET_USER_DCA_BOTS,
  GET_USER_DEALS,
  GET_USER_GRID_BOTS,
  GET_USER_EXCHANGES,
  GET_USER_BALANCES,
  REDUCE_FUNDS_FROM_DEAL,
  RESTORE_BOT,
  START_BOT,
  START_DEAL,
  STOP_BOT,
  UPDATE_COMBO_BOT_SETTINGS,
  UPDATE_COMBO_DEAL,
  UPDATE_DCA_BOT_SETTINGS,
  UPDATE_DCA_DEAL,
} from "./actions.const"

import botsResources from "./resources/bots.resources"
import dealsResources from "./resources/deals.resources"
import generalResources from "./resources/general.resources"
import userResources from "./resources/user.resources"

/**
 * HMAC SHA256 implementation using Web Crypto API
 * This works in modern browsers and Node.js without requiring the crypto module
 */
async function createHmacSha256(
  secret: string,
  message: string,
): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(message)

    // Import the key for HMAC
    const cryptoKey = await globalThis.crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    )

    // Generate the HMAC signature
    const signature = await globalThis.crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData,
    )

    // Convert ArrayBuffer to base64 string
    const bytes = new Uint8Array(signature)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  } catch (error) {
    // Fallback if Web Crypto API is not available
    throw new Error("HMAC generation failed: Web Crypto API not available")
  }
}

/**
 * Custom query string encoder to avoid using node:querystring
 */
function encodeQueryString(obj: Record<string, unknown>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      params.append(key, String(value))
    }
  }
  return params.toString()
}

/**
 * Helper function to fetch all pages of data
 * @param this IExecuteFunctions
 * @param options API request options
 * @param baseUrl Base URL for the API
 * @param endpoint API endpoint
 * @param itemsFieldPath Name of the items array in the response
 * @param secret Secret for signature generation
 * @param token API token
 * @param method HTTP method
 * @param queryStringBuilder Function to build the query string for each page
 * @returns Array of all items from all pages
 */
async function fetchAllItems(
  this: IExecuteFunctions,
  options: object,
  baseUrl: string,
  endpoint: string,
  itemsFieldPath: string,
  secret: string,
  token: string,
  method: string,
  queryStringBuilder: (pageNum: number) => string,
): Promise<IDataObject[]> {
  let allItems: IDataObject[] = []
  let page = 1
  let hasMorePages = true

  while (hasMorePages) {
    // Update query string for the current page
    const qs = queryStringBuilder(page)

    // Update timestamp for each request
    const timestamp = Date.now()

    // Generate new signature
    const signature = await getSignature(
      secret,
      "", // For GET requests, body is empty
      method,
      endpoint + qs,
      timestamp,
    )

    // Update options for the current page request
    const pageOptions = {
      ...options,
      url: `${baseUrl}${endpoint}${qs}`,
      headers: {
        "Content-Type": "application/json",
        Token: token,
        Time: timestamp,
        Signature: signature,
      },
    }

    // Make the request
    const response = await this.helpers.httpRequest({
      ...pageOptions,
      json: true,
    })

    if (response.status === "NOTOK") {
      throw new Error(`Error: ${response.reason}`)
    }

    // console.log(`Page ${page} response:`, JSON.stringify(response, null, 2))

    // Extract items based on the field path
    let pageItems: IDataObject[] = []
    const pathParts = itemsFieldPath.split(".")

    // Handle different response structures
    let currentObj = response
    let foundItems = false

    for (const part of pathParts) {
      if (currentObj && currentObj[part] !== undefined) {
        currentObj = currentObj[part]
      } else {
        // console.log(`Path part ${part} not found in response`)
        currentObj = null
        break
      }
    }

    if (currentObj && Array.isArray(currentObj)) {
      pageItems = currentObj
      foundItems = true
      // console.log(
      //   `Found ${pageItems.length} items using path ${itemsFieldPath}`
      // )
    }

    // If we didn't find items using the specified path, try to find an array in response.data
    if (!foundItems && response.data) {
      // console.log(
      //   "Searching for items array in response.data:",
      //   Object.keys(response.data)
      // )
      for (const key of Object.keys(response.data)) {
        if (Array.isArray(response.data[key])) {
          pageItems = response.data[key]
          // console.log(`Found ${pageItems.length} items in the ${key} array`)
          foundItems = true
          break
        }
      }
    }

    // If we still didn't find items, check for nested data structures
    if (!foundItems && response.data && typeof response.data === "object") {
      for (const key of Object.keys(response.data)) {
        const nestedData = response.data[key]
        if (nestedData && typeof nestedData === "object") {
          for (const nestedKey of Object.keys(nestedData)) {
            if (Array.isArray(nestedData[nestedKey])) {
              pageItems = nestedData[nestedKey]
              // console.log(
              //   `Found ${pageItems.length} items in nested array data.${key}.${nestedKey}`
              // )
              foundItems = true
              break
            }
          }
          if (foundItems) {
            break
          }
        }
      }
    }

    // Add items to the aggregate if found
    if (pageItems && Array.isArray(pageItems) && pageItems.length > 0) {
      allItems = allItems.concat(pageItems)
    } else {
      // console.log(
      //   "No items found in this page of the response or empty array returned"
      // )
    }

    // Check if there are more pages - look for pagination info
    let nextPage = false

    // Check for pagination in response.data
    if (response.data && response.data.pagination) {
      if (
        response.data.pagination.page !== undefined &&
        response.data.pagination.totalPages !== undefined &&
        response.data.pagination.page < response.data.pagination.totalPages
      ) {
        // console.log(
        //   `More pages available: Current page ${response.data.pagination.page}, Total pages ${response.data.pagination.totalPages}`
        // )
        nextPage = true
      }
    }
    // Standard pagination directly in response.data
    else if (
      response.data &&
      response.data.page !== undefined &&
      response.data.totalPages !== undefined &&
      response.data.page < response.data.totalPages
    ) {
      // console.log(
      //   `More pages available: Current page ${response.data.page}, Total pages ${response.data.totalPages}`
      // )
      nextPage = true
    }
    // Handle array responses with pagination in first element
    else if (
      Array.isArray(response) &&
      response.length > 0 &&
      response[0].pagination &&
      response[0].pagination.page !== undefined &&
      response[0].pagination.totalPages !== undefined &&
      response[0].pagination.page < response[0].pagination.totalPages
    ) {
      // console.log(
      //   `More pages available (array format): Current page ${response[0].pagination.page}, Total pages ${response[0].pagination.totalPages}`
      // )
      nextPage = true
    }

    if (nextPage) {
      page++
    } else {
      // console.log("No more pages or pagination info not found")
      hasMorePages = false
    }
  }

  // console.log(`Total items aggregated: ${allItems.length}`)
  return allItems
}

const getSignature = async(
  secret: string,
  body: string | null,
  method: string,
  endpoint: string,
  timestamp: number,
) => {
  return await createHmacSha256(
    secret,
    (body || "") + method + endpoint + timestamp,
  )
}

export class Gainium implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Gainium",
    name: "Gainium",
    icon: "file:gainium.svg",
    group: ["transform"],
    version: 1,
    description: "Operates with official Gainium API",
    subtitle:
      "={{$parameter[\"operation\"] || $parameter[\"resource\"] || \"Gainium API\"}}",
    defaults: {
      name: "Gainium API",
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    // @ts-ignore
    usableAsTool: true,
    credentials: [
      {
        name: "gainiumApi",
        required: true,
      },
    ],
    properties: [
      {
        displayName:
          "Please refer to official documentation of Gainium API for request formats.",
        name: "caution",
        type: "notice",
        default: "",
      },
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "General",
            value: "general",
          },
          {
            name: "Bots",
            value: "bots",
          },
          {
            name: "Deals",
            value: "deals",
          },
          {
            name: "User",
            value: "user",
          },
        ],
        default: "general",
        required: true,
      },
      ...botsResources,
      ...dealsResources,
      ...userResources,
      ...generalResources,
    ],
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const returnData: INodeExecutionData[] = []

    for (let i = 0; i < items.length; i++) {
      try {
        // First, make sure we can get the resource parameter
        let resource: string
        try {
          resource = this.getNodeParameter("resource", i) as string
        } catch (error) {
          // If we can't get the resource, default to "general"
          resource = "general"
          // console.log(
          //   "Could not get resource parameter, defaulting to 'general'"
          // )
        }

        // Now get the operation with explicit handling for each resource
        let operation: string
        if (resource === "user") {
          try {
            operation = this.getNodeParameter("operation", i) as string
          } catch (error) {
            // When triggered by Telegram for user resource, default to GET_USER_EXCHANGES
            operation = GET_USER_EXCHANGES
            // console.log(
            //   "Setting default operation for user resource: GET_USER_EXCHANGES"
            // )
          }
        } else if (resource === "general") {
          try {
            operation = this.getNodeParameter("operation", i) as string
          } catch (error) {
            operation = GET_SUPPORTED_EXCHANGE
            // console.log(
            //   "Setting default operation for general resource: GET_SUPPORTED_EXCHANGE"
            // )
          }
        } else if (resource === "bots") {
          try {
            operation = this.getNodeParameter("operation", i) as string
          } catch (error) {
            operation = GET_USER_GRID_BOTS
            // console.log(
            //   "Setting default operation for bots resource: GET_USER_GRID_BOTS"
            // )
          }
        } else if (resource === "deals") {
          try {
            operation = this.getNodeParameter("operation", i) as string
          } catch (error) {
            operation = GET_USER_DEALS
            // console.log(
            //   "Setting default operation for deals resource: GET_USER_DEALS"
            // )
          }
        } else {
          try {
            operation = this.getNodeParameter("operation", i) as string
          } catch (error) {
            throw new Error(
              `Could not determine operation for resource: ${resource}`,
            )
          }
        }

        const credentials = await this.getCredentials("gainiumApi")
        const baseUrl = credentials.base_url as string
        const token = credentials.token as string
        const secret = credentials.secret as string

        let endpoint: string
        let method: string
        let body: string | IDataObject
        let signature: string
        let qs = ""
        let botId: string
        let botType: string
        let botSettings: string
        let botName: string
        let terminal: boolean
        let page: number
        let status: string
        let paperContext: boolean
        let pageNumber: number
        let dealId: string
        let dealSettings: string
        let qty: string
        let asset: string
        let symbol: string
        let type: string
        let close_type: string

        let options = {}
        // Always generate timestamp at the start of each item
        // eslint-disable-next-line prefer-const
        let timestamp = Date.now()
        switch (resource) {
          case "bots":
            switch (operation) {
              case GET_USER_GRID_BOTS:
                status = this.getNodeParameter("status", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                endpoint = "/api/bots/grid"
                method = "GET"
                // For GET, do not send a body
                body = ""

                const returnAllGridBots = this.getNodeParameter(
                  "returnAll",
                  i,
                  true,
                ) as boolean

                if (returnAllGridBots) {
                  // First make a request to see the actual structure
                  qs = `?${
                    status ? `status=${status}&` : ""
                  }paperContext=${paperContext}&page=1`
                  signature = await getSignature(
                    secret,
                    body,
                    method,
                    endpoint + qs,
                    timestamp,
                  )

                  const initialResponse = await this.helpers.httpRequest({
                    url: `${baseUrl}${endpoint}${qs}`,
                    method: method as IHttpRequestMethods,
                    headers: {
                      "Content-Type": "application/json",
                      Token: token,
                      Time: timestamp,
                      Signature: signature,
                    },
                    json: true,
                  })

                  // console.log(
                  //   "Initial response structure:",
                  //   JSON.stringify(initialResponse, null, 2)
                  // )

                  // Determine the correct items path based on response structure
                  let itemsPath = "data.items"
                  if (initialResponse.data && initialResponse.data.result) {
                    itemsPath = "data.result"
                  } else if (
                    initialResponse.data &&
                    !initialResponse.data.items
                  ) {
                    // Find the first array in the response data
                    for (const key in initialResponse.data) {
                      if (Array.isArray(initialResponse.data[key])) {
                        itemsPath = `data.${key}`
                        break
                      }
                    }
                  }

                  const gridBotsResponse = await fetchAllItems.call(
                    this,
                    {
                      method,
                      headers: {
                        "Content-Type": "application/json",
                        Token: token,
                      },
                    },
                    baseUrl,
                    endpoint,
                    itemsPath,
                    secret,
                    token,
                    method,
                    pageNum =>
                      `?${
                        status ? `status=${status}&` : ""
                      }paperContext=${paperContext}&page=${pageNum}`,
                  )

                  // Format the response with the same structure as received
                  const responseData =
                    initialResponse.data && initialResponse.data.result
                      ? {
                        result: gridBotsResponse,
                        totalResults: gridBotsResponse.length,
                      }
                      : {
                        items: gridBotsResponse,
                        itemsCount: gridBotsResponse.length,
                      }

                  returnData.push({
                    json: {
                      data: responseData,
                    },
                  })
                  continue
                }

                pageNumber = this.getNodeParameter("pageNumber", i) as number
                qs = `?${
                  status ? `status=${status}&` : ""
                }paperContext=${paperContext}&page=${pageNumber}`
                signature = await getSignature(
                  secret,
                  body,
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case GET_USER_COMBO_BOTS:
                status = this.getNodeParameter("status", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                endpoint = "/api/bots/combo"
                method = "GET"
                body = ""

                const returnAllComboBots = this.getNodeParameter(
                  "returnAll",
                  i,
                  true,
                ) as boolean

                if (returnAllComboBots) {
                  // First make a request to see the actual structure
                  qs = `?${
                    status ? `status=${status}&` : ""
                  }paperContext=${paperContext}&page=1`
                  signature = await getSignature(
                    secret,
                    body,
                    method,
                    endpoint + qs,
                    timestamp,
                  )

                  const initialResponse = await this.helpers.httpRequest({
                    url: `${baseUrl}${endpoint}${qs}`,
                    method: method as IHttpRequestMethods,
                    headers: {
                      "Content-Type": "application/json",
                      Token: token,
                      Time: timestamp,
                      Signature: signature,
                    },
                    json: true,
                  })

                  // console.log(
                  //   "Initial combo bots response structure:",
                  //   JSON.stringify(initialResponse, null, 2)
                  // )

                  // Determine the correct items path based on response structure
                  let itemsPath = "data.items"
                  if (initialResponse.data && initialResponse.data.result) {
                    itemsPath = "data.result"
                  } else if (
                    initialResponse.data &&
                    !initialResponse.data.items
                  ) {
                    // Find the first array in the response data
                    for (const key in initialResponse.data) {
                      if (Array.isArray(initialResponse.data[key])) {
                        itemsPath = `data.${key}`
                        break
                      }
                    }
                  }

                  const comboBotsResponse = await fetchAllItems.call(
                    this,
                    {
                      method,
                      headers: {
                        "Content-Type": "application/json",
                        Token: token,
                      },
                    },
                    baseUrl,
                    endpoint,
                    itemsPath,
                    secret,
                    token,
                    method,
                    pageNum =>
                      `?${
                        status ? `status=${status}&` : ""
                      }paperContext=${paperContext}&page=${pageNum}`,
                  )

                  // Format the response with the same structure as received
                  const responseData =
                    initialResponse.data && initialResponse.data.result
                      ? {
                        result: comboBotsResponse,
                        totalResults: comboBotsResponse.length,
                      }
                      : {
                        items: comboBotsResponse,
                        itemsCount: comboBotsResponse.length,
                      }

                  returnData.push({
                    json: {
                      data: responseData,
                    },
                  })
                  continue
                }

                pageNumber = this.getNodeParameter("pageNumber", i) as number
                qs = `?${
                  status ? `status=${status}&` : ""
                }paperContext=${paperContext}&page=${pageNumber}`
                signature = await getSignature(
                  secret,
                  body,
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case GET_USER_DCA_BOTS:
                status = this.getNodeParameter("status", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                endpoint = "/api/bots/dca"
                method = "GET"
                body = ""

                const returnAllDcaBots = this.getNodeParameter(
                  "returnAll",
                  i,
                  true,
                ) as boolean

                if (returnAllDcaBots) {
                  // First make a request to see the actual structure
                  qs = `?${
                    status ? `status=${status}&` : ""
                  }paperContext=${paperContext}&page=1`
                  signature = await getSignature(
                    secret,
                    body,
                    method,
                    endpoint + qs,
                    timestamp,
                  )

                  const initialResponse = await this.helpers.httpRequest({
                    url: `${baseUrl}${endpoint}${qs}`,
                    method: method as IHttpRequestMethods,
                    headers: {
                      "Content-Type": "application/json",
                      Token: token,
                      Time: timestamp,
                      Signature: signature,
                    },
                    json: true,
                  })

                  // console.log(
                  //   "Initial DCA bots response structure:",
                  //   JSON.stringify(initialResponse, null, 2)
                  // )

                  // Determine the correct items path based on response structure
                  let itemsPath = "data.items"
                  if (initialResponse.data && initialResponse.data.result) {
                    itemsPath = "data.result"
                  } else if (
                    initialResponse.data &&
                    !initialResponse.data.items
                  ) {
                    // Find the first array in the response data
                    for (const key in initialResponse.data) {
                      if (Array.isArray(initialResponse.data[key])) {
                        itemsPath = `data.${key}`
                        break
                      }
                    }
                  }

                  const dcaBotsResponse = await fetchAllItems.call(
                    this,
                    {
                      method,
                      headers: {
                        "Content-Type": "application/json",
                        Token: token,
                      },
                    },
                    baseUrl,
                    endpoint,
                    itemsPath,
                    secret,
                    token,
                    method,
                    pageNum =>
                      `?${
                        status ? `status=${status}&` : ""
                      }paperContext=${paperContext}&page=${pageNum}`,
                  )

                  // Format the response with the same structure as received
                  const responseData =
                    initialResponse.data && initialResponse.data.result
                      ? {
                        result: dcaBotsResponse,
                        totalResults: dcaBotsResponse.length,
                      }
                      : {
                        items: dcaBotsResponse,
                        itemsCount: dcaBotsResponse.length,
                      }

                  returnData.push({
                    json: {
                      data: responseData,
                    },
                  })
                  continue
                }

                pageNumber = this.getNodeParameter("pageNumber", i) as number
                qs = `?${
                  status ? `status=${status}&` : ""
                }paperContext=${paperContext}&page=${pageNumber}`
                signature = await getSignature(
                  secret,
                  body,
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case UPDATE_DCA_BOT_SETTINGS:
                botId = this.getNodeParameter("botId", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                botSettings = this.getNodeParameter("botSettings", i) as string
                endpoint = "/api/updateDCABot"
                method = "POST"
                body = JSON.parse(botSettings)
                qs = `?botId=${botId}&paperContext=${paperContext}`
                signature = await getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case CLONE_DCA_BOT:
                botId = this.getNodeParameter("botId", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                botSettings = this.getNodeParameter("botSettings", i) as string
                endpoint = "/api/cloneDCABot"
                method = "PUT"
                body = JSON.parse(botSettings)
                qs = `?botId=${botId}&paperContext=${paperContext}`
                signature = await getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case UPDATE_COMBO_BOT_SETTINGS:
                botId = this.getNodeParameter("botId", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                botSettings = this.getNodeParameter("botSettings", i) as string
                endpoint = "/api/updateComboBot"
                method = "POST"
                body = JSON.parse(botSettings)
                qs = `?botId=${botId}&paperContext=${paperContext}`
                signature = await getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case CLONE_COMBO_BOT:
                botId = this.getNodeParameter("botId", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                botSettings = this.getNodeParameter("botSettings", i) as string
                endpoint = "/api/cloneComboBot"
                method = "PUT"
                body = JSON.parse(botSettings)
                qs = `?botId=${botId}&paperContext=${paperContext}`
                signature = await getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case CHANGE_BOT_PAIRS:
                botId = this.getNodeParameter("botId", i) as string
                botName = this.getNodeParameter("botName", i) as string
                const configMode = this.getNodeParameter(
                  "configMode",
                  i,
                ) as string

                let pairsToChange: IDataObject = {}
                let pairsToSet: string[] = []
                let pairsToSetMode = ""

                if (configMode === "advanced") {
                  // Advanced mode: use pairsToChange JSON
                  const pairsToChangeStr = this.getNodeParameter(
                    "pairsToChange",
                    i,
                  ) as string
                  pairsToChange = JSON.parse(pairsToChangeStr)
                } else {
                  // Simple mode: use pairsToSet with mode
                  const pairsToSetStr = this.getNodeParameter(
                    "pairsToSet",
                    i,
                  ) as string
                  pairsToSet = pairsToSetStr.split(",").map(pair => pair.trim())
                  pairsToSetMode = this.getNodeParameter(
                    "pairsToSetMode",
                    i,
                  ) as string
                }

                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                endpoint = "/api/changeBotPairs"
                method = "POST"
                body = {
                  botId,
                  botName,
                  ...(Object.keys(pairsToChange).length === 0
                    ? {}
                    : { pairsToChange }),
                  ...(pairsToSet.length === 0
                    ? {}
                    : { pairsToSet, pairsToSetMode }),
                  paperContext,
                }
                qs = encodeQueryString(body)
                signature = await getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  `${endpoint}?${qs}`,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}?${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case START_BOT:
                botId = this.getNodeParameter("botId", i) as string
                botType = this.getNodeParameter("botType", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                endpoint = "/api/startBot"
                method = "POST"
                body = JSON.stringify({
                  botId,
                  type: botType,
                  paperContext,
                })
                qs = `?botId=${botId}&type=${botType}&paperContext=${paperContext}`
                signature = await getSignature(
                  secret,
                  body,
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case RESTORE_BOT:
                botId = this.getNodeParameter("botId", i) as string
                botType = this.getNodeParameter("botType", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                endpoint = "/api/restoreBot"
                method = "POST"
                body = JSON.stringify({
                  botId,
                  type: botType,
                  paperContext,
                })
                qs = `?botId=${botId}&type=${botType}&paperContext=${paperContext}`
                signature = await getSignature(
                  secret,
                  body,
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case STOP_BOT:
                botId = this.getNodeParameter("botId", i) as string
                botType = this.getNodeParameter("botType", i) as string

                // Get optional parameters from stopBotOptions
                const stopBotOptions = this.getNodeParameter(
                  "stopBotOptions",
                  i,
                  {},
                ) as IDataObject

                let cancelPartiallyFilled: boolean | undefined
                let closeType: string | undefined
                let closeGridType: string | undefined

                if (botType === "grid") {
                  cancelPartiallyFilled =
                    stopBotOptions.cancelPartiallyFilled as boolean
                  closeGridType = stopBotOptions.closeGridType as string
                }
                if (botType === "dca" || botType === "combo") {
                  closeType = stopBotOptions.closeType as string
                }

                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean

                endpoint = "/api/stopBot"
                method = "DELETE"
                body = JSON.stringify({
                  botId,
                  botType,
                  ...(cancelPartiallyFilled === undefined
                    ? {}
                    : { cancelPartiallyFilled }),
                  ...(closeType === undefined ? {} : { closeType }),
                  ...(closeGridType === undefined ? {} : { closeGridType }),
                  paperContext,
                })
                qs = `?botId=${botId}&botType=${botType}${
                  cancelPartiallyFilled !== undefined
                    ? `&cancelPartiallyFilled=${cancelPartiallyFilled}`
                    : ""
                }${closeType !== undefined ? `&closeType=${closeType}` : ""}${
                  closeGridType !== undefined
                    ? `&closeGridType=${closeGridType}`
                    : ""
                }&paperContext=${paperContext}`
                signature = await getSignature(
                  secret,
                  body,
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case ARCHIVE_BOT:
                botId = this.getNodeParameter("botId", i) as string
                botType = this.getNodeParameter("botType", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean

                endpoint = "/api/archiveBot"
                method = "DELETE"
                body = JSON.stringify({
                  botId,
                  botType,
                  paperContext,
                })
                qs = `?botId=${botId}&botType=${botType}&paperContext=${paperContext}`
                signature = await getSignature(
                  secret,
                  body,
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              default:
                throw new Error(`Operation ${operation} is not supported`)
            }
            break
          case "deals":
            switch (operation) {
              case GET_USER_DEALS:
                // Get parameters - botType and status are now standalone fields
                const dealsAdditionalFields = this.getNodeParameter(
                  "additionalFields",
                  i,
                  {},
                ) as IDataObject

                // Get standalone parameters
                status = this.getNodeParameter("status", i) as string
                botType = this.getNodeParameter("botType", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                // Get parameters from additionalFields
                terminal = (dealsAdditionalFields.terminal as boolean) || false
                botId = (dealsAdditionalFields.botId as string) || ""
                endpoint = "/api/deals"
                method = "GET"
                body = ""

                const returnAllDeals = this.getNodeParameter(
                  "returnAll",
                  i,
                  true,
                ) as boolean

                if (returnAllDeals) {
                  // First make a request to see the actual structure
                  const dealsQueryObj = {
                    status,
                    paperContext,
                    terminal,
                    page: 1,
                    botId,
                    botType,
                  }
                  const initialQs = encodeQueryString(dealsQueryObj)
                  signature = await getSignature(
                    secret,
                    body,
                    method,
                    `${endpoint}?${initialQs}`,
                    timestamp,
                  )

                  const initialResponse = await this.helpers.httpRequest({
                    url: `${baseUrl}${endpoint}?${initialQs}`,
                    method: method as IHttpRequestMethods,
                    headers: {
                      "Content-Type": "application/json",
                      Token: token,
                      Time: timestamp,
                      Signature: signature,
                    },
                    json: true,
                  })

                  // console.log(
                  //   "Initial deals response structure:",
                  //   JSON.stringify(initialResponse, null, 2)
                  // )

                  // Determine the correct items path based on response structure
                  let itemsPath = "data.items"
                  if (initialResponse.data && initialResponse.data.result) {
                    itemsPath = "data.result"
                  } else if (
                    initialResponse.data &&
                    !initialResponse.data.items
                  ) {
                    // Find the first array in the response data
                    for (const key in initialResponse.data) {
                      if (Array.isArray(initialResponse.data[key])) {
                        itemsPath = `data.${key}`
                        break
                      }
                    }
                  }

                  const dealsResponse = await fetchAllItems.call(
                    this,
                    {
                      method,
                      headers: {
                        "Content-Type": "application/json",
                        Token: token,
                      },
                    },
                    baseUrl,
                    endpoint,
                    itemsPath,
                    secret,
                    token,
                    method,
                    pageNum => {
                      const queryObj = {
                        status,
                        paperContext,
                        terminal,
                        page: pageNum,
                        botId,
                        botType,
                      }
                      return "?" + encodeQueryString(queryObj)
                    },
                  )

                  // Format the response with the same structure as received
                  const responseData =
                    initialResponse.data && initialResponse.data.result
                      ? {
                        result: dealsResponse,
                        totalResults: dealsResponse.length,
                      }
                      : {
                        items: dealsResponse,
                        itemsCount: dealsResponse.length,
                      }

                  returnData.push({
                    json: {
                      data: responseData,
                    },
                  })
                  continue
                }

                page = this.getNodeParameter("pageNumber", i) as number
                const dealsQueryObj = {
                  status,
                  paperContext,
                  terminal,
                  page,
                  botId,
                  botType,
                }
                qs = encodeQueryString(dealsQueryObj)
                signature = await getSignature(
                  secret,
                  body,
                  method,
                  `${endpoint}?${qs}`,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}?${qs}`,
                  method,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case UPDATE_DCA_DEAL:
                dealId = this.getNodeParameter("dealId", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                dealSettings = this.getNodeParameter(
                  "dealSettings",
                  i,
                ) as string
                endpoint = "/api/updateDCADeal"
                method = "POST"
                body = JSON.parse(dealSettings)
                qs = `?dealId=${dealId}&paperContext=${paperContext}`
                signature = await getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case UPDATE_COMBO_DEAL:
                dealId = this.getNodeParameter("dealId", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                dealSettings = this.getNodeParameter(
                  "dealSettings",
                  i,
                ) as string
                endpoint = "/api/updateComboDeal"
                method = "POST"
                body = JSON.parse(dealSettings)
                qs = `?dealId=${dealId}&paperContext=${paperContext}`
                signature = await getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case ADD_FUNDS_TO_DEAL:
                dealId = this.getNodeParameter("dealId", i) as string
                botId = this.getNodeParameter("botId", i) as string
                qty = this.getNodeParameter("qty", i) as string
                asset = this.getNodeParameter("asset", i) as string
                symbol = this.getNodeParameter("symbol", i) as string
                type = this.getNodeParameter("type", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                endpoint = "/api/addFunds"
                method = "POST"
                body = {
                  dealId,
                  botId,
                  qty,
                  asset,
                  symbol,
                  type,
                  paperContext,
                }
                qs = encodeQueryString(body)
                signature = await getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  `${endpoint}?${qs}`,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}?${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case REDUCE_FUNDS_FROM_DEAL:
                dealId = this.getNodeParameter("dealId", i) as string
                botId = this.getNodeParameter("botId", i) as string
                qty = this.getNodeParameter("qty", i) as string
                asset = this.getNodeParameter("asset", i) as string
                symbol = this.getNodeParameter("symbol", i) as string
                type = this.getNodeParameter("type", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                endpoint = "/api/reduceFunds"
                method = "POST"
                body = {
                  dealId,
                  botId,
                  qty,
                  asset,
                  symbol,
                  type,
                  paperContext,
                }
                qs = encodeQueryString(body)
                signature = await getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  `${endpoint}?${qs}`,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}?${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case START_DEAL:
                botId = this.getNodeParameter("botId", i) as string
                symbol = this.getNodeParameter("symbol", i) as string
                botType = this.getNodeParameter("botType", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                endpoint = "/api/startDeal"
                method = "POST"
                body = {
                  botId,
                  symbol,
                  botType,
                  paperContext,
                }
                qs = encodeQueryString(body)
                signature = await getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  `${endpoint}?${qs}`,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}?${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case CLOSE_DEAL:
                dealId = this.getNodeParameter("dealId", i) as string
                close_type = this.getNodeParameter("close_type", i) as string
                type = this.getNodeParameter("botType", i) as string
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i,
                ) as boolean
                endpoint = `/api/closeDeal/${dealId}`
                method = "DELETE"
                body = {
                  type: close_type,
                  botType: type,
                  paperContext,
                }
                qs = encodeQueryString(body)
                signature = await getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  `${endpoint}?${qs}`,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}?${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              default:
                throw new Error(`Operation ${operation} is not supported`)
            }
            break
          case "user":
            switch (operation) {
              case GET_USER_EXCHANGES:
                // For Telegram triggers, ensure we initialize paperContext with default value
                // when we can't get it directly
                try {
                  paperContext = this.getNodeParameter(
                    "exchangePaperContext",
                    i,
                  ) as boolean
                } catch (error) {
                  // Default to false as specified in user.resources.ts
                  paperContext = false
                  // console.log(
                  //   "paperContext parameter not found, using default: false"
                  // )
                }
                endpoint = "/api/user/exchanges"
                method = "GET"
                body = ""
                qs = `?paperContext=${paperContext}`
                signature = await getSignature(
                  secret,
                  body,
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case GET_USER_BALANCES:
                // Get optional parameters from additionalFields
                const balanceAdditionalFields = this.getNodeParameter(
                  "additionalFields",
                  i,
                  {},
                ) as IDataObject

                const exchangeId =
                  (balanceAdditionalFields.exchangeId as string) || ""
                const balancePaperContext =
                  (balanceAdditionalFields.balancePaperContext as boolean) ||
                  false
                const assets = (balanceAdditionalFields.assets as string) || ""

                endpoint = "/api/user/balances"
                method = "GET"
                body = ""

                const returnAllBalances = this.getNodeParameter(
                  "returnAll",
                  i,
                  true,
                ) as boolean

                if (returnAllBalances) {
                  // This implementation fetches all pages of balances by checking if
                  // the current page has fewer than 500 items, indicating it's the last page

                  let allBalances: IDataObject[] = []
                  let page = 1
                  let hasMorePages = true
                  let currentPageSize = 0
                  const PAGE_SIZE_THRESHOLD = 500 // Each page has up to 500 items

                  // console.log(
                  //   `Starting to fetch all balances, paging through results...`
                  // )

                  // Continue fetching pages until we get fewer than 500 items or error occurs
                  while (hasMorePages) {
                    // Construct query params for this page
                    const queryParams: string[] = []
                    if (exchangeId) {
                      queryParams.push(`exchangeId=${exchangeId}`)
                    }
                    if (balancePaperContext !== undefined) {
                      queryParams.push(`paperContext=${balancePaperContext}`)
                    }
                    if (assets) {
                      queryParams.push(`assets=${encodeURIComponent(assets)}`)
                    }
                    queryParams.push(`page=${page}`)
                    queryParams.push(`pageSize=${PAGE_SIZE_THRESHOLD}`) // Explicitly request page size

                    const pageQs =
                      queryParams.length > 0 ? `?${queryParams.join("&")}` : ""

                    // Generate signature for this request
                    const pageTimestamp = Date.now()
                    const pageSignature = await getSignature(
                      secret,
                      body,
                      method,
                      endpoint + pageQs,
                      pageTimestamp,
                    )

                    try {
                      // console.log(`Fetching balances page ${page}...`)

                      // Make the request for this page
                      const pageResponse = await this.helpers.httpRequest({
                        url: `${baseUrl}${endpoint}${pageQs}`,
                        method: method as IHttpRequestMethods,
                        headers: {
                          "Content-Type": "application/json",
                          Token: token,
                          Time: pageTimestamp,
                          Signature: pageSignature,
                        },
                        json: true,
                      })

                      // console.log(
                      //   `Page ${page} response structure: ${JSON.stringify(
                      //     pageResponse ? typeof pageResponse : "undefined"
                      //   )}`
                      // )

                      // Handle the unique array-based response structure for balances
                      if (Array.isArray(pageResponse)) {
                        // The response is an array, check if it has the expected structure
                        if (pageResponse.length > 0) {
                          // Extract the data array from the first element
                          const firstElement = pageResponse[0]

                          if (
                            firstElement &&
                            firstElement.data &&
                            Array.isArray(firstElement.data)
                          ) {
                            // Get the data for this page
                            const pageData = firstElement.data as IDataObject[]
                            currentPageSize = pageData.length
                            // console.log(
                            //   `Page ${page} contains ${currentPageSize} items`
                            // )

                            // Add the items to our collection
                            allBalances = allBalances.concat(pageData)

                            // Check for explicit pagination info
                            if (firstElement.pagination) {
                              const pagination = firstElement.pagination

                              if (
                                pagination.page !== undefined &&
                                pagination.totalPages !== undefined &&
                                pagination.page < pagination.totalPages
                              ) {
                                // There are more pages according to pagination info
                                // console.log(
                                //   `More pages available based on pagination info: ${pagination.page}/${pagination.totalPages}`
                                // )
                                page++
                                continue
                              }
                            }

                            // If no explicit pagination or no more pages, use page size to determine if more pages exist
                            if (currentPageSize >= PAGE_SIZE_THRESHOLD) {
                              // We received a full page, which means there might be more data
                              // console.log(
                              //   `Page ${page} contains ${currentPageSize} items (equal to threshold), checking for more pages...`
                              // )
                              page++
                            } else {
                              // We received fewer items than the threshold, this is likely the last page
                              // console.log(
                              //   `Page ${page} has fewer than ${PAGE_SIZE_THRESHOLD} items (${currentPageSize}), no more pages needed`
                              // )
                              hasMorePages = false
                            }
                          } else {
                            // The first element doesn't have a data array
                            // console.log(
                            //   `Response is an array but doesn't match expected structure, stopping pagination`
                            // )
                            // console.log(
                            //   `First element structure: ${JSON.stringify(
                            //     firstElement
                            //       ? Object.keys(firstElement)
                            //       : "undefined"
                            //   )}`
                            // )
                            hasMorePages = false
                          }
                        } else {
                          // Empty array response
                          // console.log(
                          //   `Received empty array response on page ${page}, stopping pagination`
                          // )
                          hasMorePages = false
                        }
                      } else if (pageResponse && pageResponse.data) {
                        // Alternative format where data is directly in the response object
                        let dataArray: IDataObject[] = []

                        // Try to find the data array
                        if (Array.isArray(pageResponse.data)) {
                          dataArray = pageResponse.data
                        } else if (
                          pageResponse.data.data &&
                          Array.isArray(pageResponse.data.data)
                        ) {
                          dataArray = pageResponse.data.data
                        }

                        if (dataArray.length > 0) {
                          currentPageSize = dataArray.length
                          // console.log(
                          //   `Page ${page} contains ${currentPageSize} items (alternative format)`
                          // )

                          // Add the items to our collection
                          allBalances = allBalances.concat(dataArray)

                          // Check for pagination in direct response
                          if (pageResponse.data.pagination) {
                            const pagination = pageResponse.data.pagination

                            if (
                              pagination.page !== undefined &&
                              pagination.totalPages !== undefined &&
                              pagination.page < pagination.totalPages
                            ) {
                              // There are more pages according to pagination info
                              // console.log(
                              //   `More pages available based on pagination info: ${pagination.page}/${pagination.totalPages}`
                              // )
                              page++
                              continue
                            }
                          }

                          // Use page size to determine if more pages exist
                          if (currentPageSize >= PAGE_SIZE_THRESHOLD) {
                            page++
                          } else {
                            hasMorePages = false
                          }
                        } else {
                          // Empty data array
                          // console.log(
                          //   `Received empty data array on page ${page}, stopping pagination`
                          // )
                          hasMorePages = false
                        }
                      } else {
                        // Unexpected response format
                        // console.log(
                        //   `Unexpected response format on page ${page}, stopping pagination`
                        // )
                        // console.log(
                        //   `Response structure: ${JSON.stringify(
                        //     pageResponse
                        //       ? Object.keys(pageResponse)
                        //       : "undefined"
                        //   )}`
                        // )
                        hasMorePages = false
                      }
                    } catch (error) {
                      // console.log(`Error fetching page ${page}: ${error}`)
                      hasMorePages = false
                    }
                  }

                  // console.log(
                  //   `Total balances aggregated: ${allBalances.length}`
                  // )

                  // Create a cleaner response object with all balance items directly in a data array
                  const responseObject: IDataObject = {
                    data: allBalances,
                    pagination: {
                      page: page,
                      totalPages: page,
                      totalResults: allBalances.length,
                    },
                  }

                  returnData.push({
                    json: responseObject,
                  })

                  continue
                }

                let balancePage = 1
                try {
                  balancePage = this.getNodeParameter("pageNumber", i) as number
                } catch (e) {
                  // Optional parameter
                }

                // Construct query string with only provided parameters
                const queryParams = []
                if (exchangeId) {
                  queryParams.push(`exchangeId=${exchangeId}`)
                }
                if (balancePaperContext !== undefined) {
                  queryParams.push(`paperContext=${balancePaperContext}`)
                }
                if (balancePage) {
                  queryParams.push(`page=${balancePage}`)
                }
                if (assets) {
                  queryParams.push(`assets=${encodeURIComponent(assets)}`)
                }
                qs = queryParams.length > 0 ? `?${queryParams.join("&")}` : ""

                signature = await getSignature(
                  secret,
                  body,
                  method,
                  endpoint + qs,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              default:
                throw new Error(`Operation ${operation} is not supported`)
            }
            break
          case "general":
            switch (operation) {
              case GET_SUPPORTED_EXCHANGE:
                endpoint = "/api/exchanges"
                method = "GET"
                body = ""
                signature = await getSignature(
                  secret,
                  body,
                  method,
                  endpoint,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}`,
                  method,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              case GET_CRYPTO_SCREENER:
                // Get parameters from direct fields instead of additionalFields
                const enableFilter = this.getNodeParameter(
                  "enableFilter",
                  i,
                  false,
                ) as boolean
                const filterModel = enableFilter
                  ? (this.getNodeParameter("filterModel", i, "") as string)
                  : ""

                // Get optional parameters from additionalFields for sorting
                const screenerAdditionalFields = this.getNodeParameter(
                  "additionalFields",
                  i,
                  {},
                ) as IDataObject
                const sortField =
                  (screenerAdditionalFields.sortField as string) || ""
                const sortType =
                  (screenerAdditionalFields.sortType as string) || ""

                endpoint = "/api/screener"
                method = "GET"
                body = ""

                const returnAllScreenerResults = this.getNodeParameter(
                  "returnAll",
                  i,
                  true,
                ) as boolean

                if (returnAllScreenerResults) {
                  // Build base query parameters for screener (without pagination)
                  const baseScreenerParams: IDataObject = {}
                  if (sortField) {
                    baseScreenerParams.sortField = sortField
                  }
                  if (sortType) {
                    baseScreenerParams.sortType = sortType
                  }
                  if (enableFilter && filterModel) {
                    try {
                      baseScreenerParams.filterModel = JSON.parse(filterModel)
                    } catch (error) {
                      throw new Error(
                        `Invalid JSON in filterModel: ${
                          error instanceof Error
                            ? error.message
                            : "Unknown error"
                        }`,
                      )
                    }
                  }

                  // Fetch all screener results with specialized pagination handling
                  let allScreenerItems: IDataObject[] = []
                  let currentPage = 0
                  let hasMorePages = true
                  const pageSize = 100 // Maximum page size for efficiency

                  while (hasMorePages) {
                    const screenerParams = {
                      ...baseScreenerParams,
                      page: currentPage,
                      pageSize: pageSize,
                    }

                    const screenerQs =
                      Object.keys(screenerParams).length > 0
                        ? `?${new URLSearchParams(
                          Object.entries(screenerParams).reduce(
                            (acc, [key, value]) => {
                              if (
                                key === "filterModel" &&
                                  typeof value === "object"
                              ) {
                                acc[key] = JSON.stringify(value)
                              } else {
                                acc[key] = String(value)
                              }
                              return acc
                            },
                              {} as Record<string, string>,
                          ),
                        ).toString()}`
                        : ""

                    const pageTimestamp = Date.now()
                    const pageSignature = await getSignature(
                      secret,
                      body,
                      method,
                      endpoint + screenerQs,
                      pageTimestamp,
                    )

                    const pageResponse = await this.helpers.httpRequest({
                      url: `${baseUrl}${endpoint}${screenerQs}`,
                      method: method as IHttpRequestMethods,
                      headers: {
                        "Content-Type": "application/json",
                        Token: token,
                        Time: pageTimestamp,
                        Signature: pageSignature,
                      },
                      json: true,
                    })

                    if (pageResponse.status === "NOTOK") {
                      throw new Error(`Error: ${pageResponse.reason}`)
                    }

                    // Extract items from the current page
                    let pageItems: IDataObject[] = []
                    if (
                      pageResponse.data &&
                      pageResponse.data.result &&
                      Array.isArray(pageResponse.data.result)
                    ) {
                      pageItems = pageResponse.data.result
                    } else if (
                      pageResponse.data &&
                      pageResponse.data.items &&
                      Array.isArray(pageResponse.data.items)
                    ) {
                      pageItems = pageResponse.data.items
                    } else if (
                      pageResponse.data &&
                      Array.isArray(pageResponse.data)
                    ) {
                      pageItems = pageResponse.data
                    }

                    // Add items to our collection
                    if (pageItems.length > 0) {
                      allScreenerItems = allScreenerItems.concat(pageItems)
                    }

                    // Check if there are more pages
                    // Method 1: Check if current page returned fewer items than page size
                    if (pageItems.length < pageSize) {
                      hasMorePages = false
                    }
                    // Method 2: Check for pagination info in response
                    else if (
                      pageResponse.data &&
                      pageResponse.data.pagination
                    ) {
                      const pagination = pageResponse.data.pagination
                      if (
                        pagination.currentPage !== undefined &&
                        pagination.totalPages !== undefined
                      ) {
                        hasMorePages =
                          pagination.currentPage < pagination.totalPages - 1
                      } else if (
                        pagination.page !== undefined &&
                        pagination.totalPages !== undefined
                      ) {
                        hasMorePages =
                          pagination.page < pagination.totalPages - 1
                      } else {
                        hasMorePages = pageItems.length === pageSize
                      }
                    }
                    // Method 3: Check for total count and current position
                    else if (pageResponse.data && pageResponse.data.total) {
                      hasMorePages =
                        pageItems.length === pageSize &&
                        allScreenerItems.length < pageResponse.data.total
                    }
                    // Method 4: Default - continue if we got a full page
                    else {
                      hasMorePages = pageItems.length === pageSize
                    }

                    if (hasMorePages) {
                      currentPage++
                    }
                  }

                  // Format the response with the same structure as received
                  const responseData = {
                    result: allScreenerItems,
                    totalResults: allScreenerItems.length,
                  }

                  returnData.push({
                    json: {
                      data: responseData,
                    },
                  })
                  continue
                }

                // Single page request with limit
                const limit = this.getNodeParameter("limit", i, 100) as number
                const screenerParams: IDataObject = {}

                screenerParams.page = 0
                screenerParams.pageSize = Math.min(limit, 100) // API max is 100
                if (sortField) {
                  screenerParams.sortField = sortField
                }
                if (sortType) {
                  screenerParams.sortType = sortType
                }
                if (enableFilter && filterModel) {
                  try {
                    screenerParams.filterModel = JSON.parse(filterModel)
                  } catch (error) {
                    throw new Error(
                      `Invalid JSON in filterModel: ${
                        error instanceof Error ? error.message : "Unknown error"
                      }`,
                    )
                  }
                }

                const screenerQs =
                  Object.keys(screenerParams).length > 0
                    ? `?${new URLSearchParams(
                      Object.entries(screenerParams).reduce(
                        (acc, [key, value]) => {
                          if (
                            key === "filterModel" &&
                              typeof value === "object"
                          ) {
                            acc[key] = JSON.stringify(value)
                          } else {
                            acc[key] = String(value)
                          }
                          return acc
                        },
                          {} as Record<string, string>,
                      ),
                    ).toString()}`
                    : ""

                endpoint = `/api/screener${screenerQs}`
                signature = await getSignature(
                  secret,
                  body,
                  method,
                  endpoint,
                  timestamp,
                )
                options = {
                  url: `${baseUrl}${endpoint}`,
                  method,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: timestamp,
                    Signature: signature,
                  },
                }
                break
              default:
                throw new Error(`Operation ${operation} is not supported`)
            }
        }
        const response = await this.helpers.httpRequest({
          ...(options as IHttpRequestOptions),
          json: true,
        })
        if (response.status === "NOTOK") {
          throw new Error(`Error: ${response.reason}`)
        }

        // Special handling for GET_SUPPORTED_EXCHANGE to return response.data directly
        if (resource === "general" && operation === GET_SUPPORTED_EXCHANGE) {
          returnData.push({ json: response.data || response })
        }
        // Special handling for GET_USER_EXCHANGES to return response.data directly
        else if (resource === "user" && operation === GET_USER_EXCHANGES) {
          returnData.push({ json: response.data || response })
        }
        // Special handling for GET_USER_BALANCES to ensure consistent format
        else if (resource === "user" && operation === GET_USER_BALANCES) {
          let balancesData = []

          // Process the array-based response format
          if (
            Array.isArray(response) &&
            response.length > 0 &&
            response[0].data
          ) {
            balancesData = response[0].data

            // Create a clean response structure
            returnData.push({
              json: {
                data: balancesData,
                pagination: response[0].pagination || {
                  page: 1,
                  totalPages: 1,
                  totalResults: balancesData.length,
                },
              },
            })
          } else {
            // Fallback if response doesn't match expected format
            returnData.push({ json: { data: response.data || response } })
          }
        } else {
          // Standard handling for other operations
          returnData.push({ json: { data: response.data } })
        }
      } catch (e: unknown) {
        // console.log(e)
        if (this.continueOnFail()) {
          const errorMessage = e instanceof Error ? e.message : String(e)
          returnData.push({ json: { error: errorMessage } })
          continue
        } else {
          throw e
        }
      }
    }

    return [returnData]
  }
}

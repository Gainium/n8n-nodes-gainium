import {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  INodeExecutionData,
  INodeType,
  INodeTypeBaseDescription,
  INodeTypeDescription,
  NodeConnectionType,
} from "n8n-workflow"

import {
  buildQuery,
  gainiumApiRequest,
  gainiumApiRequestAllItems,
} from "../GenericFunctions"
import { v2Properties } from "./descriptions"

export class GainiumV2 implements INodeType {
  description: INodeTypeDescription

  constructor(baseDescription: INodeTypeBaseDescription) {
    this.description = {
      ...baseDescription,
      version: 2,
      description: "Operates with the official Gainium API (v2)",
      subtitle:
        "={{$parameter[\"operation\"] + \": \" + $parameter[\"resource\"]}}",
      defaults: { name: "Gainium" },
      inputs: [NodeConnectionType.Main],
      outputs: [NodeConnectionType.Main],
      // @ts-ignore - usableAsTool is supported at runtime
      usableAsTool: true,
      credentials: [{ name: "gainiumApi", required: true }],
      properties: v2Properties,
    }
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const returnData: INodeExecutionData[] = []

    const pushItems = (data: IDataObject[]) => {
      for (const entry of data) {
        returnData.push({ json: entry })
      }
    }

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter("resource", i) as string
        const operation = this.getNodeParameter("operation", i) as string
        // Paper vs live account — sent as the `paper-context` header on every
        // account-scoped call (default false on ops where it isn't shown).
        const paper = this.getNodeParameter(
          "paperContext",
          i,
          false,
        ) as boolean
        const ctx = this
        const api = (
          method: IHttpRequestMethods,
          path: string,
          body?: IDataObject,
        ) => gainiumApiRequest.call(ctx, method, path, body, paper)
        const apiAll = (buildPath: (page: number) => string) =>
          gainiumApiRequestAllItems.call(ctx, buildPath, paper)

        // ----- list/paginated helper -----
        const handleList = async(buildPath: (page: number) => string) => {
          const returnAll = this.getNodeParameter("returnAll", i) as boolean
          if (returnAll) {
            const all = await apiAll(buildPath)
            pushItems(all)
          } else {
            const page = this.getNodeParameter("page", i) as number
            const response = await api("GET", buildPath(page))
            pushItems((response.data as IDataObject[]) || [])
          }
        }

        if (resource === "bots") {
          const botType = () => this.getNodeParameter("botType", i) as string
          const botId = () => this.getNodeParameter("botId", i) as string

          if (operation === "list") {
            const fields = this.getNodeParameter("fields", i) as string
            const status = this.getNodeParameter("status", i) as string
            await handleList(
              (page) =>
                `/api/v2/bots/${botType()}` +
                buildQuery({ fields, page, status }),
            )
          } else if (operation === "start") {
            const response = await api("POST",
              `/api/v2/bots/${botType()}/${botId()}/start`,
            )
            returnData.push({ json: response })
          } else if (operation === "stop") {
            const type = botType()
            const query: IDataObject = {}
            if (type === "grid") {
              query.closeGridType = this.getNodeParameter("closeGridType", i)
              if (this.getNodeParameter("cancelPartiallyFilled", i)) {
                query.cancelPartiallyFilled = true
              }
            } else {
              query.closeType = this.getNodeParameter("closeType", i)
            }
            const response = await api("POST",
              `/api/v2/bots/${type}/${botId()}/stop` + buildQuery(query),
            )
            returnData.push({ json: response })
          } else if (operation === "archive") {
            const response = await api("DELETE",
              `/api/v2/bots/${botType()}/${botId()}`,
            )
            returnData.push({ json: response || { success: true } })
          } else if (operation === "restore") {
            const response = await api("POST",
              `/api/v2/bots/${botType()}/${botId()}/restore`,
            )
            returnData.push({ json: response })
          } else if (operation === "clone") {
            const name = this.getNodeParameter("cloneName", i) as string
            const body: IDataObject = name ? { name } : {}
            const response = await api("POST",
              `/api/v2/bots/${botType()}/${botId()}/clone`,
              body,
            )
            returnData.push({ json: response })
          } else if (operation === "update") {
            const settings = this.getNodeParameter("settings", i) as string
            const body = JSON.parse(settings) as IDataObject
            const response = await api("PUT",
              `/api/v2/bots/${botType()}/${botId()}`,
              body,
            )
            returnData.push({ json: response })
          } else if (operation === "changePairs") {
            const pairsToSet = (this.getNodeParameter("pairsToSet", i) as string)
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p.length > 0)
            const pairsToSetMode = this.getNodeParameter(
              "pairsToSetMode",
              i,
            ) as string
            const response = await api("PUT",
              `/api/v2/bots/${botType()}/${botId()}/pairs`,
              { pairsToSet, pairsToSetMode },
            )
            returnData.push({ json: response })
          }
        } else if (resource === "deals") {
          const dealType = () => this.getNodeParameter("dealType", i) as string

          if (operation === "list") {
            const fields = this.getNodeParameter("fields", i) as string
            const status = this.getNodeParameter("status", i) as string
            const botId = this.getNodeParameter("botId", i) as string
            await handleList(
              (page) =>
                `/api/v2/deals/${dealType()}` +
                buildQuery({ fields, page, status, botId }),
            )
          } else if (operation === "update") {
            const dealId = this.getNodeParameter("dealId", i) as string
            const settings = this.getNodeParameter("settings", i) as string
            const body = JSON.parse(settings) as IDataObject
            const response = await api("PUT",
              `/api/v2/deals/${dealType()}/${dealId}`,
              body,
            )
            returnData.push({ json: response })
          } else if (operation === "start") {
            const botId = this.getNodeParameter("botId", i) as string
            const symbol = this.getNodeParameter("symbol", i) as string
            const body: IDataObject = symbol ? { symbol } : {}
            const response = await api("POST",
              `/api/v2/deals/${dealType()}/${botId}/start`,
              body,
            )
            returnData.push({ json: response })
          } else if (operation === "close") {
            const dealId = this.getNodeParameter("dealId", i) as string
            const closeType = this.getNodeParameter("closeType", i) as string
            const response = await api("DELETE",
              `/api/v2/deals/${dealType()}/${dealId}` +
                buildQuery({ type: closeType }),
            )
            returnData.push({ json: response || { success: true } })
          } else if (operation === "manageFunds") {
            const fundsOperation = this.getNodeParameter(
              "fundsOperation",
              i,
            ) as string
            const dealId = this.getNodeParameter("dealId", i) as string
            const botId = this.getNodeParameter("botId", i) as string
            const qty = this.getNodeParameter("qty", i) as string
            const fundsType = this.getNodeParameter("fundsType", i) as string
            const symbol = this.getNodeParameter("symbol", i) as string
            const asset =
              fundsType === "fixed"
                ? (this.getNodeParameter("asset", i) as string)
                : ""
            const body: IDataObject = { qty, type: fundsType }
            if (asset) {body.asset = asset}
            if (symbol) {body.symbol = symbol}
            const response = await api("POST",
              `/api/v2/deals/dca/${fundsOperation}` +
                buildQuery({ dealId, botId }),
              body,
            )
            returnData.push({ json: response })
          }
        } else if (resource === "user") {
          if (operation === "exchanges") {
            const response = await api("GET",
              "/api/v2/user/exchanges",
            )
            pushItems((response.data as IDataObject[]) || [response])
          } else if (operation === "balances") {
            const fields = this.getNodeParameter("fields", i) as string
            const exchangeId = this.getNodeParameter("exchangeId", i) as string
            const assets = this.getNodeParameter("assets", i) as string
            await handleList(
              (page) =>
                "/api/v2/user/balances" +
                buildQuery({ fields, page, exchangeId, assets }),
            )
          }
        } else if (resource === "general") {
          if (operation === "screener") {
            const page = this.getNodeParameter("screenerPage", i) as number
            const pageSize = this.getNodeParameter("pageSize", i) as number
            const fields = this.getNodeParameter("fields", i) as string
            const sortField = this.getNodeParameter("sortField", i) as string
            const sortType = this.getNodeParameter("sortType", i) as string
            const filterModelRaw = (
              this.getNodeParameter("filterModel", i) as string
            ).trim()
            // Treat blank or an empty object as "no filter" so it isn't sent
            const filterModel =
              filterModelRaw === "" || filterModelRaw === "{}"
                ? ""
                : filterModelRaw
            const response = await api("GET",
              "/api/v2/screener" +
                buildQuery({
                  page,
                  pageSize,
                  fields,
                  sortField,
                  sortType,
                  filterModel,
                }),
            )
            pushItems((response.data as IDataObject[]) || [response])
          } else if (operation === "supportedExchanges") {
            const response = await api("GET",
              "/api/exchanges",
            )
            pushItems((response.data as IDataObject[]) || [response])
          } else if (operation === "customApiCall") {
            const method = this.getNodeParameter("customMethod", i) as
              | "GET"
              | "POST"
              | "PUT"
              | "DELETE"
            const url = this.getNodeParameter("customUrl", i) as string
            let body: IDataObject | undefined
            if (method === "POST" || method === "PUT") {
              const raw = this.getNodeParameter("customBody", i) as string
              if (raw && raw.trim()) {body = JSON.parse(raw) as IDataObject}
            }
            const response = await api(method,
              url,
              body,
            )
            returnData.push({ json: response || { success: true } })
          }
        }
      } catch (error: unknown) {
        if (this.continueOnFail()) {
          const message = error instanceof Error ? error.message : String(error)
          returnData.push({ json: { error: message } })
          continue
        }
        throw error
      }
    }

    return [returnData]
  }
}

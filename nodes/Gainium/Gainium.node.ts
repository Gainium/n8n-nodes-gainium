import {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";
import { createHmac } from "crypto";

import {
  ADD_FUNDS_TO_DEAL,
  ARCHIVE_BOT,
  CHANGE_BOT_PAIRS,
  CLOSE_DEAL,
  GET_SUPPORTED_EXCHANGE,
  GET_USER_COMBO_BOTS,
  GET_USER_DCA_BOTS,
  GET_USER_DEALS,
  GET_USER_GRID_BOTS,
  REDUCE_FUNDS_FROM_DEAL,
  RESTORE_BOT,
  START_BOT,
  START_DEAL,
  STOP_BOT,
  UPDATE_COMBO_BOT_SETTINGS,
  UPDATE_COMBO_DEAL,
  UPDATE_DCA_BOT_SETTINGS,
  UPDATE_DCA_DEAL,
} from "./actions.const";

import botsResources from "./resources/bots.resources";
import _qs from "node:querystring";
import dealsResources from "./resources/deals.resources";
import generalResources from "./resources/general.resources";

const getSignature = (
  secret: string,
  body: string | null,
  method: string,
  endpoint: string
) => {
  return createHmac("sha256", secret)
    .update(body + method + endpoint + Date.now())
    .digest("base64");
};

export class Gainium implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Gainium",
    name: "Gainium",
    icon: "file:gainium.svg",
    group: ["transform"],
    version: 1,
    description: "Operates with official Gainium API",
    subtitle: '={{$parameter["operation"]}}',
    defaults: {
      name: "Gainium API",
    },
    inputs: ["main"],
    outputs: ["main"],
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
        ],
        default: "general",
      },
      ...botsResources,
      ...dealsResources,
      ...generalResources,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter("resource", i) as string;
        const operation = this.getNodeParameter("operation", i) as string;

        const credentials = await this.getCredentials("gainiumApi");
        const baseUrl = credentials.base_url as string;
        const token = credentials.token as string;
        const secret = credentials.secret as string;

        let endpoint;
        let method;
        let body;
        let signature;
        let qs = "";
        let botId;
        let botType;
        let cancelPartiallyFilled;
        let closeType;
        let closeGridType;
        let botSettings;
        let botName;
        let pairsToChange;
        let pairsToSet;
        let pairsToSetMode;
        let terminal;
        let page;
        let status;
        let paperContext;
        let pageNumber;
        let dealId;
        let dealSettings;
        let qty;
        let asset;
        let symbol;
        let type;
        let close_type;

        let options = {};
        switch (resource) {
          case "bots":
            switch (operation) {
              case GET_USER_GRID_BOTS:
                status = this.getNodeParameter("status", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                pageNumber = this.getNodeParameter("pageNumber", i) as number;
                endpoint = "/api/bots/grid";
                method = "GET";
                body = JSON.stringify({
                  status,
                  paperContext,
                  page: pageNumber,
                });
                qs = `?${
                  status ? `status=${status}&` : ""
                }paperContext=${paperContext}&page=${pageNumber}`;
                signature = getSignature(secret, body, method, endpoint + qs);
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case GET_USER_COMBO_BOTS:
                status = this.getNodeParameter("status", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                pageNumber = this.getNodeParameter("pageNumber", i) as number;
                endpoint = "/api/bots/combo";
                method = "GET";
                body = JSON.stringify({
                  status,
                  paperContext,
                  page: pageNumber,
                });
                qs = `?${
                  status ? `status=${status}&` : ""
                }paperContext=${paperContext}&page=${pageNumber}`;
                signature = getSignature(secret, body, method, endpoint + qs);
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case GET_USER_DCA_BOTS:
                status = this.getNodeParameter("status", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                pageNumber = this.getNodeParameter("pageNumber", i) as number;
                endpoint = "/api/bots/dca";
                method = "GET";
                body = JSON.stringify({
                  status,
                  paperContext,
                  page: pageNumber,
                });
                qs = `?${
                  status ? `status=${status}&` : ""
                }paperContext=${paperContext}&page=${pageNumber}`;
                signature = getSignature(secret, body, method, endpoint + qs);
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case UPDATE_DCA_BOT_SETTINGS:
                botId = this.getNodeParameter("botId", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                botSettings = this.getNodeParameter("botSettings", i) as string;
                endpoint = "/api/updateDCABot";
                method = "POST";
                body = JSON.parse(botSettings);
                qs = `?botId=${botId}&paperContext=${paperContext}`;
                signature = getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  endpoint + qs
                );
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case UPDATE_COMBO_BOT_SETTINGS:
                botId = this.getNodeParameter("botId", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                botSettings = this.getNodeParameter("botSettings", i) as string;
                endpoint = "/api/updateComboBot";
                method = "POST";
                body = JSON.parse(botSettings);
                qs = `?botId=${botId}&paperContext=${paperContext}`;
                signature = getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  endpoint + qs
                );
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case CHANGE_BOT_PAIRS:
                botId = this.getNodeParameter("botId", i) as string;
                botName = this.getNodeParameter("botName", i) as string;
                try {
                  pairsToChange = this.getNodeParameter(
                    "options.pairsToChange.pairsToChange",
                    i
                  ) as string;
                } catch (e) {
                  pairsToChange = "{}";
                }
                pairsToChange = JSON.parse(pairsToChange);
                pairsToSet = this.getNodeParameter("pairsToSet", i) as string;
                pairsToSet = JSON.parse(pairsToSet);
                pairsToSetMode = this.getNodeParameter(
                  "pairsToSetMode",
                  i
                ) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                endpoint = "/api/changeBotPairs";
                method = "POST";
                body = {
                  botId,
                  botName,
                  ...(Object.keys(pairsToChange).length === 0
                    ? {}
                    : { pairsToChange }),
                  pairsToSet,
                  pairsToSetMode,
                  paperContext,
                };
                qs = _qs.encode(body);
                signature = getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  `${endpoint}?${qs}`
                );
                options = {
                  url: `${baseUrl}${endpoint}?${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case START_BOT:
                botId = this.getNodeParameter("botId", i) as string;
                botType = this.getNodeParameter("botType", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                endpoint = "/api/startBot";
                method = "POST";
                body = JSON.stringify({
                  botId,
                  type: botType,
                  paperContext,
                });
                qs = `?botId=${botId}&type=${botType}&paperContext=${paperContext}`;
                signature = getSignature(secret, body, method, endpoint + qs);
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case RESTORE_BOT:
                botId = this.getNodeParameter("botId", i) as string;
                botType = this.getNodeParameter("botType", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                endpoint = "/api/restoreBot";
                method = "POST";
                body = JSON.stringify({
                  botId,
                  type: botType,
                  paperContext,
                });
                qs = `?botId=${botId}&type=${botType}&paperContext=${paperContext}`;
                signature = getSignature(secret, body, method, endpoint + qs);
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case STOP_BOT:
                botId = this.getNodeParameter("botId", i) as string;
                botType = this.getNodeParameter("botType", i) as string;
                if (botType === "grid") {
                  cancelPartiallyFilled = this.getNodeParameter(
                    "cancelPartiallyFilled",
                    i
                  ) as boolean;
                  closeGridType = this.getNodeParameter(
                    "closeGridType",
                    i
                  ) as string;
                }
                if (botType === "dca") {
                  closeType = this.getNodeParameter("closeType", i) as string;
                }
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;

                endpoint = "/api/stopBot";
                method = "DELETE";
                body = JSON.stringify({
                  botId,
                  botType,
                  cancelPartiallyFilled,
                  closeType,
                  closeGridType,
                  paperContext,
                });
                qs = `?botId=${botId}&botType=${botType}&cancelPartiallyFilled=${cancelPartiallyFilled}&closeType=${closeType}&closeGridType=${closeGridType}&paperContext=${paperContext}`;
                signature = getSignature(secret, body, method, endpoint + qs);
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case ARCHIVE_BOT:
                botId = this.getNodeParameter("botId", i) as string;
                botType = this.getNodeParameter("botType", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;

                endpoint = "/api/archiveBot";
                method = "DELETE";
                body = JSON.stringify({
                  botId,
                  botType,
                  paperContext,
                });
                qs = `?botId=${botId}&botType=${botType}&paperContext=${paperContext}`;
                signature = getSignature(secret, body, method, endpoint + qs);
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              default:
                throw new Error(`Operation ${operation} is not supported`);
            }
            break;
          case "deals":
            switch (operation) {
              case GET_USER_DEALS:
                status = this.getNodeParameter("status", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                terminal = this.getNodeParameter("terminal", i) as boolean;
                page = this.getNodeParameter("page", i) as number;
                botId = this.getNodeParameter("botId", i) as string;
                botType = this.getNodeParameter("botType", i) as string;
                endpoint = "/api/deals";
                method = "GET";
                body = {
                  status,
                  paperContext,
                  terminal,
                  page,
                  botId,
                  botType,
                };
                qs = _qs.encode(body);
                signature = getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  `${endpoint}?${qs}`
                );
                options = {
                  url: `${baseUrl}${endpoint}?${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case UPDATE_DCA_DEAL:
                dealId = this.getNodeParameter("dealId", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                dealSettings = this.getNodeParameter(
                  "dealSettings",
                  i
                ) as string;
                endpoint = "/api/updateDCADeal";
                method = "POST";
                body = JSON.parse(dealSettings);
                qs = `?dealId=${dealId}&paperContext=${paperContext}`;
                signature = getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  endpoint + qs
                );
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case UPDATE_COMBO_DEAL:
                dealId = this.getNodeParameter("dealId", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                dealSettings = this.getNodeParameter(
                  "dealSettings",
                  i
                ) as string;
                endpoint = "/api/updateComboDeal";
                method = "POST";
                body = JSON.parse(dealSettings);
                qs = `?dealId=${dealId}&paperContext=${paperContext}`;
                signature = getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  endpoint + qs
                );
                options = {
                  url: `${baseUrl}${endpoint}${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case ADD_FUNDS_TO_DEAL:
                dealId = this.getNodeParameter("dealId", i) as string;
                botId = this.getNodeParameter("botId", i) as string;
                qty = this.getNodeParameter("qty", i) as string;
                asset = this.getNodeParameter("asset", i) as string;
                symbol = this.getNodeParameter("symbol", i) as string;
                type = this.getNodeParameter("type", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                endpoint = "/api/addFunds";
                method = "POST";
                body = {
                  dealId,
                  botId,
                  qty,
                  asset,
                  symbol,
                  type,
                  paperContext,
                };
                qs = _qs.encode(body);
                signature = getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  `${endpoint}?${qs}`
                );
                options = {
                  url: `${baseUrl}${endpoint}?${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case REDUCE_FUNDS_FROM_DEAL:
                dealId = this.getNodeParameter("dealId", i) as string;
                botId = this.getNodeParameter("botId", i) as string;
                qty = this.getNodeParameter("qty", i) as string;
                asset = this.getNodeParameter("asset", i) as string;
                symbol = this.getNodeParameter("symbol", i) as string;
                type = this.getNodeParameter("type", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                endpoint = "/api/reduceFunds";
                method = "POST";
                body = {
                  dealId,
                  botId,
                  qty,
                  asset,
                  symbol,
                  type,
                  paperContext,
                };
                qs = _qs.encode(body);
                signature = getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  `${endpoint}?${qs}`
                );
                options = {
                  url: `${baseUrl}${endpoint}?${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case START_DEAL:
                botId = this.getNodeParameter("botId", i) as string;
                symbol = this.getNodeParameter("symbol", i) as string;
                botType = this.getNodeParameter("botType", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                endpoint = "/api/startDeal";
                method = "POST";
                body = {
                  botId,
                  symbol,
                  botType,
                  paperContext,
                };
                qs = _qs.encode(body);
                signature = getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  `${endpoint}?${qs}`
                );
                options = {
                  url: `${baseUrl}${endpoint}?${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              case CLOSE_DEAL:
                dealId = this.getNodeParameter("dealId", i) as string;
                close_type = this.getNodeParameter("close_type", i) as string;
                type = this.getNodeParameter("botType", i) as string;
                paperContext = this.getNodeParameter(
                  "paperContext",
                  i
                ) as boolean;
                endpoint = `/api/closeDeal/${dealId}`;
                method = "DELETE";
                body = {
                  type: close_type,
                  botType: type,
                  paperContext,
                };
                qs = _qs.encode(body);
                signature = getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  `${endpoint}?${qs}`
                );
                options = {
                  url: `${baseUrl}${endpoint}?${qs}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              default:
                throw new Error(`Operation ${operation} is not supported`);
            }
            break;
          case "general":
            switch (operation) {
              case GET_SUPPORTED_EXCHANGE:
                endpoint = "/api/exchanges";
                method = "GET";
                body = {};
                signature = getSignature(
                  secret,
                  JSON.stringify(body),
                  method,
                  endpoint
                );
                options = {
                  url: `${baseUrl}${endpoint}`,
                  method,
                  body,
                  headers: {
                    "Content-Type": "application/json",
                    Token: token,
                    Time: Date.now(),
                    Signature: signature,
                  },
                };
                break;
              default:
                throw new Error(`Operation ${operation} is not supported`);
            }
        }
        const response = await this.helpers.request({
          ...options,
          json: true,
        });
        if (response.status === "NOTOK")
          throw new Error(`Error: ${response.reason}`);
        returnData.push({ json: { data: response.data } });
      } catch (e: any) {
        console.log(e);
        if (this.continueOnFail()) {
          returnData.push({ json: { error: e.message } });
          continue;
        } else {
          throw e;
        }
      }
    }

    return [returnData];
  }
}

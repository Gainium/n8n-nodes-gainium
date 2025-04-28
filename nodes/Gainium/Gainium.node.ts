import {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";
import { createHmac } from "crypto";

const getSignature = (
  secret: string,
  body: string,
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
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ["bots"],
          },
        },
        options: [
          {
            name: "Get User Grid Bots",
            value: "get_user_grid_bots",
            description: "Get User Grid Bots",
            action: "Get User Grid Bots",
          },
          {
            name: "Get User Combo Bots",
            value: "get_user_combo_bots",
            description: "Get User Combo Bots",
            action: "Get User Combo Bots",
          },
          {
            name: "Get User DCA Bots",
            value: "get_user_dca_bots",
            description: "Get User DCA Bots",
            action: "Get User DCA Bots",
          },
          {
            name: "Update Bot Settings",
            value: "update_bot_settings",
            description: "Update Bot Settings",
            action: "Update Bot Settings",
          },
          {
            name: "Change Bot Pairs",
            value: "chage_bot_pairs",
            description: "Change Bot Pairs",
            action: "Change Bot Pairs",
          },
        ],
        default: "get_user_grid_bots",
      },
      {
        displayName: "Status",
        name: "status",
        type: "options",
        required: false,
        default: "",
        description: "The status of the bot.",
        displayOptions: {
          show: {
            resource: ["bots"],
            operation: [
              "get_user_grid_bots",
              "get_user_combo_bots",
              "get_user_dca_bots",
            ],
          },
        },
        options: [
          {
            name: "Open",
            value: "open",
          },
          {
            name: "Closed",
            value: "closed",
          },
          {
            name: "Error",
            value: "error",
          },
          {
            name: "Archive",
            value: "archive",
          },
          {
            name: "Range",
            value: "range",
          },
        ],
      },
      {
        displayName: "Paper Context",
        name: "paperContext",
        type: "boolean",
        required: true,
        default: false,
        displayOptions: {
          show: {
            resource: ["bots"],
            operation: [
              "get_user_grid_bots",
              "get_user_combo_bots",
              "get_user_dca_bots",
            ],
          },
        },
      },
      {
        displayName: "Page Number",
        name: "pageNumber",
        type: "number",
        required: true,
        default: 1,
        displayOptions: {
          show: {
            resource: ["bots"],
            operation: [
              "get_user_grid_bots",
              "get_user_combo_bots",
              "get_user_dca_bots",
            ],
          },
        },
      },
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

        let options = {};
        switch (resource) {
          case "bots":
            let status;
            let paperContext;
            let pageNumber;

            switch (operation) {
              case "get_user_grid_bots":
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
                  pageNumber,
                });
                signature = getSignature(secret, body, method, endpoint);
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
              case "get_user_combo_bots":
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
                  pageNumber,
                });
                signature = getSignature(secret, body, method, endpoint);
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
              case "get_user_dca_bots":
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
                  pageNumber,
                });
                signature = getSignature(secret, body, method, endpoint);
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
            break;
        }
        const response = await this.helpers.request(options);
        returnData.push({ json: JSON.parse(response) });
      } catch (e: any) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: e.message } });
          continue;
        }
      }
    }

    return [returnData];
  }
}

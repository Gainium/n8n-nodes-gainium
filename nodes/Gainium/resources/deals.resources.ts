import { INodeProperties } from "n8n-workflow";
import {
  ADD_FUNDS_TO_DEAL,
  CLOSE_DEAL,
  GET_USER_DEALS,
  REDUCE_FUNDS_FROM_DEAL,
  START_DEAL,
  UPDATE_COMBO_DEAL,
  UPDATE_DCA_DEAL,
} from "../actions.const";

export default [
  {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ["deals"],
      },
    },
    options: [
      {
        name: "Get User Deals",
        value: GET_USER_DEALS,
        description: "Get User Deals",
        action: "Get User Deals",
      },
      {
        name: "Update DCA Deal",
        value: UPDATE_DCA_DEAL,
        description: "Update DCA Deal",
        action: "Update DCA Deal",
      },
      {
        name: "Update Combo Deal",
        value: UPDATE_COMBO_DEAL,
        description: "Update Combo Deal",
        action: "Update Combo Deal",
      },
      {
        name: "Add Funds To Deal",
        value: ADD_FUNDS_TO_DEAL,
        description: "Add Funds To Deal",
        action: "Add Funds To Deal",
      },
      {
        name: "Reduce Funds From Deal",
        value: REDUCE_FUNDS_FROM_DEAL,
        description: "Reduce Funds From Deal",
        action: "Reduce Funds From Deal",
      },
      {
        name: "Start Deal",
        value: START_DEAL,
        description: "Start Deal",
        action: "Start Deal",
      },
      {
        name: "Close Deal",
        value: CLOSE_DEAL,
        description: "Close Deal",
        action: "Close Deal",
      },
    ],
    default: GET_USER_DEALS,
    required: true,
  },
  {
    displayName: "This operation requires write permission of API keys.",
    name: "caution_write_access",
    type: "notice",
    default: "",
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [UPDATE_DCA_DEAL, UPDATE_COMBO_DEAL],
      },
    },
  },
  {
    displayName: "Status",
    name: "status",
    type: "options",
    required: false,
    default: "",
    description: "Status of deals.",
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [GET_USER_DEALS],
      },
    },
    options: [
      {
        name: "Closed",
        value: "closed",
      },
      {
        name: "Open",
        value: "open",
      },
      {
        name: "Error",
        value: "error",
      },
      {
        name: "Start",
        value: "start",
      },
      {
        name: "Canceled",
        value: "canceled",
      },
    ],
  },
  {
    displayName: "Deal Id",
    name: "dealId",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [UPDATE_DCA_DEAL, UPDATE_COMBO_DEAL, CLOSE_DEAL],
      },
    },
  },
  {
    displayName: "Deal Id",
    name: "dealId",
    type: "string",
    required: false,
    default: "",
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [ADD_FUNDS_TO_DEAL, REDUCE_FUNDS_FROM_DEAL],
      },
    },
  },
  {
    displayName: "Use Paper Context",
    name: "paperContext",
    type: "boolean",
    required: false,
    default: false,
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [
          GET_USER_DEALS,
          UPDATE_DCA_DEAL,
          UPDATE_COMBO_DEAL,
          ADD_FUNDS_TO_DEAL,
          REDUCE_FUNDS_FROM_DEAL,
          START_DEAL,
          CLOSE_DEAL,
        ],
      },
    },
  },
  {
    displayName: "Terminal",
    name: "terminal",
    type: "boolean",
    required: false,
    default: false,
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [GET_USER_DEALS],
      },
    },
  },
  {
    displayName: "Page Number",
    name: "page",
    type: "number",
    required: false,
    default: 1,
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [GET_USER_DEALS],
      },
    },
  },
  {
    displayName: "Close Type",
    name: "close_type",
    type: "options",
    required: true,
    default: "cancel",
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [CLOSE_DEAL],
      },
    },
    options: [
      {
        name: "Cancel",
        value: "cancel",
      },
      {
        name: "Close by Limit",
        value: "closeByLimit",
      },
      {
        name: "Close by Market",
        value: "closeByMarket",
      },
      {
        name: "leave",
        value: "leave",
      },
    ],
  },
  {
    displayName: "Bot Id",
    name: "botId",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [ADD_FUNDS_TO_DEAL, REDUCE_FUNDS_FROM_DEAL, START_DEAL],
      },
    },
  },
  {
    displayName: "Bot Id",
    name: "botId",
    type: "string",
    required: false,
    default: "",
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [GET_USER_DEALS],
      },
    },
  },
  {
    displayName: "Bot Type",
    name: "botType",
    type: "options",
    required: true,
    default: "dca",
    description: "Bot type.",
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [START_DEAL, CLOSE_DEAL],
      },
    },
    options: [
      {
        name: "DCA",
        value: "dca",
      },
      {
        name: "Combo",
        value: "combo",
      },
    ],
  },
  {
    displayName: "Bot Type",
    name: "botType",
    type: "options",
    required: false,
    default: "",
    description: "Bot type.",
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [GET_USER_DEALS],
      },
    },
    options: [
      {
        name: "DCA",
        value: "dca",
      },
      {
        name: "Combo",
        value: "combo",
      },
    ],
  },
  {
    displayName: "Quantity",
    name: "qty",
    type: "string",
    required: true,
    default: "",
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [ADD_FUNDS_TO_DEAL, REDUCE_FUNDS_FROM_DEAL],
      },
    },
  },
  {
    displayName: "Qty Type",
    name: "type",
    type: "options",
    required: false,
    default: "fixed",
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [ADD_FUNDS_TO_DEAL, REDUCE_FUNDS_FROM_DEAL],
      },
    },
    options: [
      {
        name: "Fixed",
        value: "fixed",
      },
      {
        name: "Percentage",
        value: "perc",
      },
    ],
  },
  {
    displayName: "Asset",
    name: "asset",
    type: "options",
    required: false,
    default: "",
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [ADD_FUNDS_TO_DEAL, REDUCE_FUNDS_FROM_DEAL],
      },
    },
    options: [
      {
        name: "Base",
        value: "base",
      },
      {
        name: "Quote",
        value: "quote",
      },
    ],
  },
  {
    displayName: "Symbol",
    name: "symbol",
    type: "string",
    required: false,
    default: "",
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [ADD_FUNDS_TO_DEAL, REDUCE_FUNDS_FROM_DEAL, START_DEAL],
      },
    },
  },
  {
    displayName: "Deal Settings",
    name: "dealSettings",
    type: "json",
    required: true,
    default: `{
  "ordersCount": 0,
  "tpPerc": "string",
  "slPerc": "string",
  "profitCurrency": "base",
  "avgPrice": 0,
  "orderSize": "string",
  "useTp": true,
  "useSl": true,
  "useDca": true,
  "useSmartOrders": true,
  "activeOrdersCount": 0,
  "volumeScale": "string",
  "stepScale": 0,
  "dealCloseConditionSL": "tp",
  "useMultiSl": true,
  "multiSl": [
    {
      "target": "-10",
      "amount": "50",
      "uuid": "string"
    }
  ],
  "baseSlOn": "start",
  "trailingSl": true,
  "moveSL": true,
  "moveSLTrigger": "10",
  "moveSLValue": "5",
  "dealCloseCondition": "tp",
  "closeByTimer": true,
  "closeByTimerValue": 0,
  "closeByTimerUnits": "seconds",
  "useMultiTp": true,
  "multiTp": [
    {
      "target": "10",
      "amount": "50",
      "uuid": "string"
    }
  ],
  "trailingTp": true,
  "trailingTpPerc": "5",
  "dcaCondition": "percentage",
  "dcaCustom": [
    {
      "step": "1",
      "size": "1",
      "uuid": "string"
    }
  ]
}`,
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [UPDATE_DCA_DEAL],
      },
    },
  },
  {
    displayName: "Deal Settings",
    name: "dealSettings",
    type: "json",
    required: true,
    default: `{
  "ordersCount": 0,
  "tpPerc": "string",
  "slPerc": "string",
  "profitCurrency": "base",
  "avgPrice": 0,
  "useTp": true,
  "useSl": true,
  "useDca": true,
  "useSmartOrders": true,
  "activeOrdersCount": 0,
  "volumeScale": "string",
  "stepScale": 0,
  "comboTpBase": "full"
}`,
    displayOptions: {
      show: {
        resource: ["deals"],
        operation: [UPDATE_COMBO_DEAL],
      },
    },
  },
] as INodeProperties[];

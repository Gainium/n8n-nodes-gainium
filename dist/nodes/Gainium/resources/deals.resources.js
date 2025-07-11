"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_const_1 = require("../actions.const");
exports.default = [
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
                value: actions_const_1.GET_USER_DEALS,
                description: "Get User Deals",
                action: "Get User Deals",
            },
            {
                name: "Update DCA Deal",
                value: actions_const_1.UPDATE_DCA_DEAL,
                description: "Update DCA Deal",
                action: "Update DCA Deal",
            },
            {
                name: "Update Combo Deal",
                value: actions_const_1.UPDATE_COMBO_DEAL,
                description: "Update Combo Deal",
                action: "Update Combo Deal",
            },
            {
                name: "Add Funds To Deal",
                value: actions_const_1.ADD_FUNDS_TO_DEAL,
                description: "Add Funds To Deal",
                action: "Add Funds To Deal",
            },
            {
                name: "Reduce Funds From Deal",
                value: actions_const_1.REDUCE_FUNDS_FROM_DEAL,
                description: "Reduce Funds From Deal",
                action: "Reduce Funds From Deal",
            },
            {
                name: "Start Deal",
                value: actions_const_1.START_DEAL,
                description: "Start Deal",
                action: "Start Deal",
            },
            {
                name: "Close Deal",
                value: actions_const_1.CLOSE_DEAL,
                description: "Close Deal",
                action: "Close Deal",
            },
        ],
        default: actions_const_1.GET_USER_DEALS,
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
                operation: [actions_const_1.UPDATE_DCA_DEAL, actions_const_1.UPDATE_COMBO_DEAL],
            },
        },
    },
    {
        displayName: "Paper Trading",
        name: "paperContext",
        type: "boolean",
        required: true,
        default: false,
        description: "Whether to use paper trading or real trading",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.GET_USER_DEALS, actions_const_1.UPDATE_DCA_DEAL, actions_const_1.UPDATE_COMBO_DEAL],
            },
        },
    },
    {
        displayName: "Bot Type",
        name: "botType",
        type: "options",
        default: "dca",
        description: "Bot type",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.GET_USER_DEALS],
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
        displayName: "Status",
        name: "status",
        type: "options",
        default: "open",
        description: "Status of deals",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.GET_USER_DEALS],
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
        displayName: "Return All Items",
        name: "returnAll",
        type: "boolean",
        default: true,
        description: "Whether to return all items by automatically paginating through results",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.GET_USER_DEALS],
            },
        },
    },
    {
        displayName: "Page Number",
        name: "pageNumber",
        type: "number",
        required: true,
        default: 1,
        description: "Page number for paginated results",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.GET_USER_DEALS],
                returnAll: [false],
            },
        },
    },
    {
        displayName: "Additional Options",
        name: "additionalFields",
        type: "collection",
        placeholder: "Add Option",
        default: {},
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.GET_USER_DEALS],
            },
        },
        options: [
            {
                displayName: "Bot ID",
                name: "botId",
                type: "string",
                default: "",
                description: "ID of the bot to filter deals by",
            },
            {
                displayName: "Terminal",
                name: "terminal",
                type: "boolean",
                default: false,
                description: "Whether to filter deals by terminal status",
            },
        ],
    },
    {
        displayName: "Deal Id",
        name: "dealId",
        type: "string",
        required: true,
        default: "",
        description: "ID of the deal to update",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.UPDATE_DCA_DEAL, actions_const_1.UPDATE_COMBO_DEAL],
            },
        },
    },
    {
        displayName: "Close Type",
        name: "close_type",
        type: "options",
        required: true,
        default: "cancel",
        description: "Method to use when closing the deal",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.CLOSE_DEAL],
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
    // START_DEAL fields in specified order
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
                operation: [actions_const_1.START_DEAL],
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
        displayName: "Bot Id",
        name: "botId",
        type: "string",
        required: true,
        default: "",
        description: "ID of the bot to start a deal for",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.START_DEAL],
            },
        },
    },
    {
        displayName: "Symbol",
        name: "symbol",
        type: "string",
        required: false,
        default: "",
        description: "Trading pair symbol (e.g., BTC/USDT)",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.START_DEAL],
            },
        },
    },
    {
        displayName: "Paper",
        name: "paperContext",
        type: "boolean",
        required: false,
        default: false,
        description: "Whether to use paper trading or real trading",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.START_DEAL],
            },
        },
    },
    // CLOSE_DEAL fields in specified order
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
                operation: [actions_const_1.CLOSE_DEAL],
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
        displayName: "Deal Id",
        name: "dealId",
        type: "string",
        required: true,
        default: "",
        description: "ID of the deal to close",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.CLOSE_DEAL],
            },
        },
    },
    {
        displayName: "Paper",
        name: "paperContext",
        type: "boolean",
        required: false,
        default: false,
        description: "Whether to use paper trading or real trading",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.CLOSE_DEAL],
            },
        },
    },
    {
        displayName: "Bot Id",
        name: "botId",
        type: "string",
        required: true,
        default: "",
        description: "ID of the bot to add/reduce funds for",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.ADD_FUNDS_TO_DEAL, actions_const_1.REDUCE_FUNDS_FROM_DEAL],
            },
        },
    },
    {
        displayName: "Deal Id",
        name: "dealId",
        type: "string",
        required: false,
        default: "",
        description: "ID of the specific deal to add/reduce funds for",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.ADD_FUNDS_TO_DEAL, actions_const_1.REDUCE_FUNDS_FROM_DEAL],
            },
        },
    },
    {
        displayName: "Symbol",
        name: "symbol",
        type: "string",
        required: false,
        default: "",
        description: "Trading pair symbol (e.g., BTC/USDT) for the deal",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.ADD_FUNDS_TO_DEAL, actions_const_1.REDUCE_FUNDS_FROM_DEAL],
            },
        },
    },
    {
        displayName: "Quantity",
        name: "qty",
        type: "string",
        required: true,
        default: "",
        description: "Amount of funds to add or reduce from the deal",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.ADD_FUNDS_TO_DEAL, actions_const_1.REDUCE_FUNDS_FROM_DEAL],
            },
        },
    },
    {
        displayName: "Qty Type",
        name: "type",
        type: "options",
        required: false,
        default: "fixed",
        description: "Whether the quantity is a fixed amount or a percentage",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.ADD_FUNDS_TO_DEAL, actions_const_1.REDUCE_FUNDS_FROM_DEAL],
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
        description: "Type of asset to add or reduce funds from (base or quote currency)",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.ADD_FUNDS_TO_DEAL, actions_const_1.REDUCE_FUNDS_FROM_DEAL],
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
        displayName: "Paper",
        name: "paperContext",
        type: "boolean",
        required: false,
        default: false,
        description: "Whether to use paper trading or real trading",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.ADD_FUNDS_TO_DEAL, actions_const_1.REDUCE_FUNDS_FROM_DEAL],
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
        description: "JSON object containing all settings for the DCA deal",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.UPDATE_DCA_DEAL],
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
        description: "JSON object containing all settings for the Combo deal",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: [actions_const_1.UPDATE_COMBO_DEAL],
            },
        },
    },
];

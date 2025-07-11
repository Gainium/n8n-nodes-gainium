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
                resource: ["bots"],
            },
        },
        options: [
            {
                name: "Get User Grid Bots",
                value: actions_const_1.GET_USER_GRID_BOTS,
                description: "Get User Grid Bots",
                action: "Get User Grid Bots",
            },
            {
                name: "Get User Combo Bots",
                value: actions_const_1.GET_USER_COMBO_BOTS,
                description: "Get User Combo Bots",
                action: "Get User Combo Bots",
            },
            {
                name: "Get User DCA Bots",
                value: actions_const_1.GET_USER_DCA_BOTS,
                description: "Get User DCA Bots",
                action: "Get User DCA Bots",
            },
            {
                name: "Update DCA Bot Settings",
                value: actions_const_1.UPDATE_DCA_BOT_SETTINGS,
                description: "Update DCA Bot Settings",
                action: "Update DCA Bot Settings",
            },
            {
                name: "Update Combo Bot Settings",
                value: actions_const_1.UPDATE_COMBO_BOT_SETTINGS,
                description: "Update Combo Bot Settings",
                action: "Update Combo Bot Settings",
            },
            {
                name: "Change Bot Pairs",
                value: actions_const_1.CHANGE_BOT_PAIRS,
                description: "Change Bot Pairs",
                action: "Change Bot Pairs",
            },
            {
                name: "Start Bot",
                value: actions_const_1.START_BOT,
                description: "Start Bot",
                action: "Start Bot",
            },
            {
                name: "Stop Bot",
                value: actions_const_1.STOP_BOT,
                description: "Stop Bot",
                action: "Stop Bot",
            },
            {
                name: "Archive Bot",
                value: actions_const_1.ARCHIVE_BOT,
                description: "Archive Bot",
                action: "Archive Bot",
            },
            {
                name: "Restore Bot",
                value: actions_const_1.RESTORE_BOT,
                description: "Restore Bot",
                action: "Restore Bot",
            },
            {
                name: "Clone DCA Bot",
                value: actions_const_1.CLONE_DCA_BOT,
                description: "Clone DCA Bot",
                action: "Clone DCA Bot",
            },
            {
                name: "Clone Combo Bot",
                value: actions_const_1.CLONE_COMBO_BOT,
                description: "Clone Combo Bot",
                action: "Clone Combo Bot",
            },
        ],
        default: actions_const_1.GET_USER_GRID_BOTS,
        required: true,
    },
    {
        displayName: "This operation requires write permission of API keys.",
        name: "caution_write_access",
        type: "notice",
        default: "",
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [
                    actions_const_1.UPDATE_DCA_BOT_SETTINGS,
                    actions_const_1.UPDATE_COMBO_BOT_SETTINGS,
                    actions_const_1.CHANGE_BOT_PAIRS,
                    actions_const_1.START_BOT,
                    actions_const_1.STOP_BOT,
                    actions_const_1.RESTORE_BOT,
                    actions_const_1.ARCHIVE_BOT,
                    actions_const_1.CLONE_DCA_BOT,
                    actions_const_1.CLONE_COMBO_BOT,
                ],
            },
        },
    },
    {
        displayName: "Status",
        name: "status",
        type: "options",
        default: "open",
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
                name: "Archive",
                value: "archive",
            },
            {
                name: "Error",
                value: "error",
            },
            {
                name: "Range",
                value: "range",
            },
        ],
        description: "Filter bots by status",
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [actions_const_1.GET_USER_GRID_BOTS, actions_const_1.GET_USER_DCA_BOTS, actions_const_1.GET_USER_COMBO_BOTS],
            },
        },
    },
    {
        displayName: "Page Number",
        name: "pageNumber",
        type: "number",
        required: false,
        default: 1,
        description: "Page number (only used when 'Return All' is disabled)",
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [actions_const_1.GET_USER_GRID_BOTS, actions_const_1.GET_USER_DCA_BOTS, actions_const_1.GET_USER_COMBO_BOTS],
                returnAll: [false],
            },
        },
    },
    {
        displayName: "Bot Type",
        name: "botType",
        type: "options",
        required: true,
        default: "grid",
        options: [
            {
                name: "Grid",
                value: "grid",
            },
            {
                name: "DCA",
                value: "dca",
            },
            {
                name: "Combo",
                value: "combo",
            },
        ],
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [actions_const_1.STOP_BOT, actions_const_1.ARCHIVE_BOT, actions_const_1.START_BOT, actions_const_1.RESTORE_BOT],
            },
        },
    },
    {
        displayName: "Bot Id",
        name: "botId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [
                    actions_const_1.STOP_BOT,
                    actions_const_1.ARCHIVE_BOT,
                    actions_const_1.UPDATE_COMBO_BOT_SETTINGS,
                    actions_const_1.UPDATE_DCA_BOT_SETTINGS,
                    actions_const_1.START_BOT,
                    actions_const_1.RESTORE_BOT,
                    actions_const_1.CLONE_DCA_BOT,
                    actions_const_1.CLONE_COMBO_BOT,
                ],
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
                resource: ["bots"],
                operation: [actions_const_1.CHANGE_BOT_PAIRS],
            },
        },
    },
    {
        displayName: "Bot Name",
        name: "botName",
        type: "string",
        required: false,
        default: "",
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [actions_const_1.CHANGE_BOT_PAIRS],
            },
        },
    },
    {
        displayName: "Configuration Mode",
        name: "configMode",
        type: "options",
        required: true,
        default: "simple",
        options: [
            {
                name: "Simple (Set Pairs with Mode)",
                value: "simple",
                description: "Use simple pairs list with add/remove/replace mode",
            },
            {
                name: "Advanced (Custom JSON)",
                value: "advanced",
                description: "Use advanced JSON configuration for complex operations",
            },
        ],
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [actions_const_1.CHANGE_BOT_PAIRS],
            },
        },
    },
    {
        displayName: "Pairs To Set",
        name: "pairsToSet",
        type: "string",
        required: true,
        default: "",
        placeholder: "BTC_USDT,ETH_USDT",
        description: "Comma-separated list of trading pairs (e.g., BTC_USDT,ETH_USDT)",
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [actions_const_1.CHANGE_BOT_PAIRS],
                configMode: ["simple"],
            },
        },
    },
    {
        displayName: "Pairs To Set Mode",
        name: "pairsToSetMode",
        type: "options",
        required: true,
        default: "replace",
        options: [
            {
                name: "Add",
                value: "add",
            },
            {
                name: "Remove",
                value: "remove",
            },
            {
                name: "Replace",
                value: "replace",
            },
        ],
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [actions_const_1.CHANGE_BOT_PAIRS],
                configMode: ["simple"],
            },
        },
    },
    {
        displayName: "Pairs To Change",
        name: "pairsToChange",
        type: "json",
        required: true,
        default: `{
  "remove": [
    "BTC_USDT"
  ],
  "add": [
    "BTC_USDT"
  ]
}`,
        description: "Advanced pairs configuration for specific add/remove operations",
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [actions_const_1.CHANGE_BOT_PAIRS],
                configMode: ["advanced"],
            },
        },
    },
    {
        displayName: "Bot Settings",
        name: "botSettings",
        type: "json",
        required: true,
        description: "Refer to the Gainium API documentation for details on field names and schema structure.",
        default: `{
  "name": "string",
  "pair": [
    "BTC_USDT"
  ],
  "ordersCount": 0,
  "tpPerc": "string",
  "slPerc": "string",
  "profitCurrency": "base",
  "orderSize": "string",
  "baseOrderSize": "string",
  "orderSizeType": "base",
  "startOrderType": "limit",
  "useRiskReduction": true,
  "riskReductionValue": "string",
  "useReinvest": true,
  "reinvestValue": "string",
  "skipBalanceCheck": true,
  "startCondition": "ASAP",
  "maxNumberOfOpenDeals": "string",
  "useStaticPriceFilter": true,
  "minOpenDeal": "string",
  "maxOpenDeal": "string",
  "useDynamicPriceFilter": true,
  "dynamicPriceFilterDirection": "over",
  "dynamicPriceFilterOverValue": "string",
  "dynamicPriceFilterUnderValue": "string",
  "dynamicPriceFilterPriceType": "avg",
  "useNoOverlapDeals": true,
  "useCooldown": true,
  "cooldownAfterDealStart": true,
  "cooldownAfterDealStartInterval": 0,
  "cooldownAfterDealStartUnits": "seconds",
  "cooldownAfterDealStop": true,
  "cooldownAfterDealStopInterval": 0,
  "cooldownAfterDealStopUnits": "seconds",
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
                resource: ["bots"],
                operation: [actions_const_1.UPDATE_DCA_BOT_SETTINGS, actions_const_1.CLONE_DCA_BOT],
            },
        },
    },
    {
        displayName: "Bot Settings",
        name: "botSettings",
        type: "json",
        required: true,
        description: "Refer to the Gainium API documentation for details on field names and schema structure.",
        default: `{
  "name": "string",
  "pair": [
    "BTC_USDT"
  ],
  "ordersCount": 0,
  "tpPerc": "string",
  "slPerc": "string",
  "profitCurrency": "base",
  "orderSize": "string",
  "baseOrderSize": "string",
  "baseStep": "string",
  "baseGridLevels": "string",
  "gridLevel": "string",
  "orderSizeType": "base",
  "startOrderType": "limit",
  "useRiskReduction": true,
  "riskReductionValue": "string",
  "useReinvest": true,
  "reinvestValue": "string",
  "skipBalanceCheck": true,
  "startCondition": "ASAP",
  "maxNumberOfOpenDeals": "string",
  "useStaticPriceFilter": true,
  "minOpenDeal": "string",
  "maxOpenDeal": "string",
  "useDynamicPriceFilter": true,
  "dynamicPriceFilterDirection": "over",
  "dynamicPriceFilterOverValue": "string",
  "dynamicPriceFilterUnderValue": "string",
  "dynamicPriceFilterPriceType": "avg",
  "useNoOverlapDeals": true,
  "useCooldown": true,
  "cooldownAfterDealStart": true,
  "cooldownAfterDealStartInterval": 0,
  "cooldownAfterDealStartUnits": "seconds",
  "cooldownAfterDealStop": true,
  "cooldownAfterDealStopInterval": 0,
  "cooldownAfterDealStopUnits": "seconds",
  "useTp": true,
  "useSl": true,
  "useDca": true,
  "useSmartOrders": true,
  "activeOrdersCount": 0,
  "useActiveMinigrids": true,
  "comboActiveMinigrids": 0,
  "comboUseSmartGrids": true,
  "comboSmartGridsCount": 0,
  "volumeScale": "string",
  "stepScale": 0,
  "comboTpBase": "full"
}`,
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [actions_const_1.UPDATE_COMBO_BOT_SETTINGS, actions_const_1.CLONE_COMBO_BOT],
            },
        },
    },
    {
        displayName: "Additional Options",
        name: "stopBotOptions",
        type: "collection",
        placeholder: "Add Option",
        default: {},
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [actions_const_1.STOP_BOT],
            },
        },
        options: [
            {
                displayName: "Cancel Partially Filled",
                name: "cancelPartiallyFilled",
                type: "boolean",
                default: false,
                description: "Available for Grid bots",
            },
            {
                displayName: "Close Type",
                name: "closeType",
                type: "options",
                default: "leave",
                description: "Available for DCA and Combo bots",
                options: [
                    {
                        name: "Cancel",
                        value: "cancel",
                    },
                    {
                        name: "Close By Limit",
                        value: "closeByLimit",
                    },
                    {
                        name: "Close By Market",
                        value: "closeByMarket",
                    },
                    {
                        name: "Leave",
                        value: "leave",
                    },
                ],
            },
            {
                displayName: "Close Grid Type",
                name: "closeGridType",
                type: "options",
                default: "cancel",
                description: "Available for Grid bots",
                options: [
                    {
                        name: "Cancel",
                        value: "cancel",
                    },
                    {
                        name: "Close By Limit",
                        value: "closeByLimit",
                    },
                    {
                        name: "Close By Market",
                        value: "closeByMarket",
                    },
                ],
            },
        ],
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
                resource: ["bots"],
                operation: [
                    actions_const_1.GET_USER_GRID_BOTS,
                    actions_const_1.GET_USER_DCA_BOTS,
                    actions_const_1.GET_USER_COMBO_BOTS,
                    actions_const_1.UPDATE_COMBO_BOT_SETTINGS,
                    actions_const_1.UPDATE_DCA_BOT_SETTINGS,
                    actions_const_1.CHANGE_BOT_PAIRS,
                    actions_const_1.START_BOT,
                    actions_const_1.STOP_BOT,
                    actions_const_1.RESTORE_BOT,
                    actions_const_1.ARCHIVE_BOT,
                    actions_const_1.CLONE_DCA_BOT,
                    actions_const_1.CLONE_COMBO_BOT,
                ],
            },
        },
    },
    {
        displayName: "Return All",
        name: "returnAll",
        type: "boolean",
        default: true,
        description: "Whether to return all results or use pagination",
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [actions_const_1.GET_USER_GRID_BOTS, actions_const_1.GET_USER_DCA_BOTS, actions_const_1.GET_USER_COMBO_BOTS],
            },
        },
    },
];

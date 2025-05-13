import { INodeProperties } from "n8n-workflow"
import {
  ARCHIVE_BOT,
  CHANGE_BOT_PAIRS,
  CLONE_DCA_BOT,
  CLONE_COMBO_BOT,
  GET_USER_COMBO_BOTS,
  GET_USER_DCA_BOTS,
  GET_USER_GRID_BOTS,
  RESTORE_BOT,
  START_BOT,
  STOP_BOT,
  UPDATE_COMBO_BOT_SETTINGS,
  UPDATE_DCA_BOT_SETTINGS,
} from "../actions.const"

export default [
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
        value: GET_USER_GRID_BOTS,
        description: "Get User Grid Bots",
        action: "Get User Grid Bots",
      },
      {
        name: "Get User Combo Bots",
        value: GET_USER_COMBO_BOTS,
        description: "Get User Combo Bots",
        action: "Get User Combo Bots",
      },
      {
        name: "Get User DCA Bots",
        value: GET_USER_DCA_BOTS,
        description: "Get User DCA Bots",
        action: "Get User DCA Bots",
      },
      {
        name: "Update DCA Bot Settings",
        value: UPDATE_DCA_BOT_SETTINGS,
        description: "Update DCA Bot Settings",
        action: "Update DCA Bot Settings",
      },
      {
        name: "Update Combo Bot Settings",
        value: UPDATE_COMBO_BOT_SETTINGS,
        description: "Update Combo Bot Settings",
        action: "Update Combo Bot Settings",
      },
      {
        name: "Change Bot Pairs",
        value: CHANGE_BOT_PAIRS,
        description: "Change Bot Pairs",
        action: "Change Bot Pairs",
      },
      {
        name: "Start Bot",
        value: START_BOT,
        description: "Start Bot",
        action: "Start Bot",
      },
      {
        name: "Stop Bot",
        value: STOP_BOT,
        description: "Stop Bot",
        action: "Stop Bot",
      },
      {
        name: "Archive Bot",
        value: ARCHIVE_BOT,
        description: "Archive Bot",
        action: "Archive Bot",
      },
      {
        name: "Restore Bot",
        value: RESTORE_BOT,
        description: "Restore Bot",
        action: "Restore Bot",
      },
      {
        name: "Clone DCA Bot",
        value: CLONE_DCA_BOT,
        description: "Clone DCA Bot",
        action: "Clone DCA Bot",
      },
      {
        name: "Clone Combo Bot",
        value: CLONE_COMBO_BOT,
        description: "Clone Combo Bot",
        action: "Clone Combo Bot",
      },
    ],
    default: GET_USER_GRID_BOTS,
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
          UPDATE_DCA_BOT_SETTINGS,
          UPDATE_COMBO_BOT_SETTINGS,
          CHANGE_BOT_PAIRS,
          START_BOT,
          STOP_BOT,
          RESTORE_BOT,
          ARCHIVE_BOT,
          CLONE_DCA_BOT,
          CLONE_COMBO_BOT,
        ],
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
        operation: [STOP_BOT, ARCHIVE_BOT, START_BOT, RESTORE_BOT],
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
          STOP_BOT,
          ARCHIVE_BOT,
          UPDATE_COMBO_BOT_SETTINGS,
          UPDATE_DCA_BOT_SETTINGS,
          START_BOT,
          RESTORE_BOT,
          CLONE_DCA_BOT,
          CLONE_COMBO_BOT,
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
        operation: [CHANGE_BOT_PAIRS],
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
        operation: [CHANGE_BOT_PAIRS],
      },
    },
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
        operation: [GET_USER_GRID_BOTS, GET_USER_DCA_BOTS, GET_USER_COMBO_BOTS],
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
    displayName: "Use Paper Context",
    name: "paperContext",
    type: "boolean",
    required: false,
    default: false,
    displayOptions: {
      show: {
        resource: ["bots"],
        operation: [
          GET_USER_GRID_BOTS,
          GET_USER_DCA_BOTS,
          GET_USER_COMBO_BOTS,
          UPDATE_COMBO_BOT_SETTINGS,
          UPDATE_DCA_BOT_SETTINGS,
          CHANGE_BOT_PAIRS,
          START_BOT,
          STOP_BOT,
          RESTORE_BOT,
          ARCHIVE_BOT,
          CLONE_DCA_BOT,
          CLONE_COMBO_BOT,
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
        operation: [GET_USER_GRID_BOTS, GET_USER_DCA_BOTS, GET_USER_COMBO_BOTS],
      },
    },
  },
  {
    displayName: "Bot Settings",
    name: "botSettings",
    type: "json",
    required: true,
    description:
      "Refer to the Gainium API documentation for details on field names and schema structure.",
    default: `{
  "name": "string",
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
        operation: [UPDATE_DCA_BOT_SETTINGS, CLONE_DCA_BOT],
      },
    },
  },
  {
    displayName: "Bot Settings",
    name: "botSettings",
    type: "json",
    required: true,
    description:
      "Refer to the Gainium API documentation for details on field names and schema structure.",
    default: `{
  "name": "string",
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
        operation: [UPDATE_COMBO_BOT_SETTINGS, CLONE_COMBO_BOT],
      },
    },
  },
  {
    displayName: "Cancel Partially Filled",
    name: "cancelPartiallyFilled",
    type: "boolean",
    required: false,
    default: false,
    displayOptions: {
      show: {
        resource: ["bots"],
        operation: [STOP_BOT],
        botType: ["grid"],
      },
    },
  },
  {
    displayName: "Close Type",
    name: "closeType",
    type: "options",
    required: false,
    default: "leave",
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
    displayOptions: {
      show: {
        resource: ["bots"],
        operation: [STOP_BOT],
        botType: ["dca", "combo"],
      },
    },
  },
  {
    displayName: "Close Grid Type",
    name: "closeGridType",
    type: "options",
    required: false,
    default: "cancel",
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
    displayOptions: {
      show: {
        resource: ["bots"],
        operation: [STOP_BOT],
        botType: ["grid"],
      },
    },
  },
  {
    displayName: "Pairs To Set",
    name: "pairsToSet",
    type: "string",
    required: false,
    default: "",
    placeholder: '["BTC_USDT", "ETH_USDT"]',
    displayOptions: {
      show: {
        resource: ["bots"],
        operation: [CHANGE_BOT_PAIRS],
      },
    },
  },
  {
    displayName: "Pairs To Set Mode",
    name: "pairsToSetMode",
    type: "options",
    required: false,
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
        operation: [CHANGE_BOT_PAIRS],
      },
    },
  },
  {
    displayName: "Options",
    name: "options",
    type: "fixedCollection",
    typeOptions: {
      multipleValues: false,
    },
    placeholder: "Pairs To Change",
    default: {},
    options: [
      {
        name: "pairsToChange",
        displayName: "Pairs To Change",
        values: [
          {
            displayName: "Pairs To Change",
            name: "pairsToChange",
            type: "json",
            required: false,
            default: `{
  "remove": [
    "BTC_USDT"
  ],
  "add": [
    "BTC_USDT"
  ]
}`,
          },
        ],
      },
    ],
    displayOptions: {
      show: {
        resource: ["bots"],
        operation: [CHANGE_BOT_PAIRS],
      },
    },
  },
] as INodeProperties[]

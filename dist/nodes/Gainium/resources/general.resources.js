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
                resource: ["general"],
            },
        },
        options: [
            {
                name: "Get Supported Exchanges",
                value: actions_const_1.GET_SUPPORTED_EXCHANGE,
                description: "Get Supported Exchanges",
                action: "Get Supported Exchanges",
            },
            {
                name: "Get Crypto Screener",
                value: actions_const_1.GET_CRYPTO_SCREENER,
                description: "Get crypto screener data with filtering and pagination",
                action: "Get Crypto Screener",
            },
        ],
        default: actions_const_1.GET_SUPPORTED_EXCHANGE,
        required: true,
    },
    {
        displayName: "Return All",
        name: "returnAll",
        type: "boolean",
        default: true,
        description: "Whether to return all results or limit to a specific number",
        displayOptions: {
            show: {
                resource: ["general"],
                operation: [actions_const_1.GET_CRYPTO_SCREENER],
            },
        },
    },
    {
        displayName: "Limit",
        name: "limit",
        type: "number",
        required: false,
        default: 100,
        typeOptions: {
            minValue: 1,
            maxValue: 1000,
        },
        description: "Maximum number of items to return",
        displayOptions: {
            show: {
                resource: ["general"],
                operation: [actions_const_1.GET_CRYPTO_SCREENER],
                returnAll: [false],
            },
        },
    },
    {
        displayName: "Sort Field",
        name: "sortField",
        type: "options",
        required: false,
        default: "currentPrice",
        description: "Field to sort by",
        displayOptions: {
            show: {
                resource: ["general"],
                operation: [actions_const_1.GET_CRYPTO_SCREENER],
            },
        },
        options: [
            {
                name: "Current Price",
                value: "currentPrice",
            },
            {
                name: "Market Cap",
                value: "marketCap",
            },
            {
                name: "Total Volume",
                value: "totalVolume",
            },
            {
                name: "Price Change 24h",
                value: "priceChangePercentage24h",
            },
            {
                name: "Price Change 7d",
                value: "priceChangePercentage7d",
            },
            {
                name: "Price Change 30d",
                value: "priceChangePercentage30d",
            },
            {
                name: "Price Change 1y",
                value: "priceChangePercentage1y",
            },
            {
                name: "Market Cap Rank",
                value: "marketCapRank",
            },
            {
                name: "Symbol",
                value: "symbol",
            },
            {
                name: "Name",
                value: "name",
            },
        ],
    },
    {
        displayName: "Sort Direction",
        name: "sortType",
        type: "options",
        required: false,
        default: "desc",
        description: "Sort direction",
        displayOptions: {
            show: {
                resource: ["general"],
                operation: [actions_const_1.GET_CRYPTO_SCREENER],
            },
        },
        options: [
            {
                name: "Ascending",
                value: "asc",
            },
            {
                name: "Descending",
                value: "desc",
            },
        ],
    },
    {
        displayName: "Filter",
        name: "enableFilter",
        type: "boolean",
        required: false,
        default: false,
        description: "Enable advanced filtering options",
        displayOptions: {
            show: {
                resource: ["general"],
                operation: [actions_const_1.GET_CRYPTO_SCREENER],
            },
        },
    },
    {
        displayName: "Filter Model",
        name: "filterModel",
        type: "json",
        required: false,
        default: `{
  "items": [
    {
      "field": "marketCap",
      "operator": ">=",
      "value": 1000000000,
      "id": 1
    },
    {
      "field": "exchanges",
      "operator": "contains",
      "value": "binance",
      "id": 2
    }
  ],
  "linkOperator": "and"
}`,
        description: "Filter model for advanced filtering",
        displayOptions: {
            show: {
                resource: ["general"],
                operation: [actions_const_1.GET_CRYPTO_SCREENER],
                enableFilter: [true],
            },
        },
    },
];

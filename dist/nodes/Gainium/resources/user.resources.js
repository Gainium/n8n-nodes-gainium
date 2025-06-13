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
                resource: ["user"],
            },
        },
        options: [
            {
                name: "Get User Exchanges",
                value: actions_const_1.GET_USER_EXCHANGES,
                description: "Get User Exchanges",
                action: "Get User Exchanges",
            },
            {
                name: "Get User Balances",
                value: actions_const_1.GET_USER_BALANCES,
                description: "Get User Balances",
                action: "Get User Balances",
            },
        ],
        default: actions_const_1.GET_USER_EXCHANGES,
        required: true,
    },
    // Parameters for GET_USER_EXCHANGES
    {
        displayName: "Paper",
        name: "exchangePaperContext",
        type: "boolean",
        required: true,
        default: false,
        description: "Whether to use paper trading or real trading",
        displayOptions: {
            show: {
                resource: ["user"],
                operation: [actions_const_1.GET_USER_EXCHANGES],
            },
        },
    },
    // Parameters for GET_USER_BALANCES
    {
        displayName: "Exchange ID",
        name: "exchangeId",
        type: "string",
        required: false,
        default: "",
        description: "Id of the exchange. Optional, if not provided - all exchanges will be used",
        displayOptions: {
            show: {
                resource: ["user"],
                operation: [actions_const_1.GET_USER_BALANCES],
            },
        },
    },
    {
        displayName: "Assets",
        name: "assets",
        type: "string",
        required: false,
        default: "",
        placeholder: "BTC,USDT",
        description: "Comma-separated list of assets to filter results",
        displayOptions: {
            show: {
                resource: ["user"],
                operation: [actions_const_1.GET_USER_BALANCES],
            },
        },
    },
    {
        displayName: "Paper",
        name: "balancePaperContext",
        type: "boolean",
        required: false,
        default: false,
        description: "Whether to use paper trading or real trading",
        displayOptions: {
            show: {
                resource: ["user"],
                operation: [actions_const_1.GET_USER_BALANCES],
            },
        },
    },
    {
        displayName: "Return All Items",
        name: "returnAll",
        type: "boolean",
        default: true,
        description: "Whether to return all items by automatically paginating through results",
        displayOptions: {
            show: {
                resource: ["user"],
                operation: [actions_const_1.GET_USER_BALANCES],
            },
        },
    },
    {
        displayName: "Page Number",
        name: "pageNumber",
        type: "number",
        required: true,
        default: 1,
        typeOptions: {
            minValue: 1,
        },
        description: "Page number. Results will be paginated by 500 assets",
        displayOptions: {
            show: {
                resource: ["user"],
                operation: [actions_const_1.GET_USER_BALANCES],
                returnAll: [false],
            },
        },
    },
];

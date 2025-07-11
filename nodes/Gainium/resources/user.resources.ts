import { INodeProperties } from "n8n-workflow"
import { GET_USER_EXCHANGES, GET_USER_BALANCES } from "../actions.const"

export default [
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
        value: GET_USER_EXCHANGES,
        description: "Get User Exchanges",
        action: "Get User Exchanges",
      },
      {
        name: "Get User Balances",
        value: GET_USER_BALANCES,
        description: "Get User Balances",
        action: "Get User Balances",
      },
    ],
    default: GET_USER_EXCHANGES,
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
        operation: [GET_USER_EXCHANGES],
      },
    },
  },
  // Parameters for GET_USER_BALANCES - Required field: Return All
  {
    displayName: "Return All Items",
    name: "returnAll",
    type: "boolean",
    default: true,
    description:
      "Whether to return all items by automatically paginating through results",
    displayOptions: {
      show: {
        resource: ["user"],
        operation: [GET_USER_BALANCES],
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
        operation: [GET_USER_BALANCES],
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
        resource: ["user"],
        operation: [GET_USER_BALANCES],
      },
    },
    options: [
      {
        displayName: "Exchange ID",
        name: "exchangeId",
        type: "string",
        default: "",
        description:
          "Id of the exchange. Optional, if not provided - all exchanges will be used",
      },
      {
        displayName: "Assets",
        name: "assets",
        type: "string",
        default: "",
        placeholder: "BTC,USDT",
        description: "Comma-separated list of assets to filter results",
      },
      {
        displayName: "Paper",
        name: "balancePaperContext",
        type: "boolean",
        default: false,
        description: "Whether to use paper trading or real trading",
      },
    ],
  },
] as INodeProperties[]

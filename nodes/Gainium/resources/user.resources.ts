import { INodeProperties } from "n8n-workflow";
import { GET_USER_EXCHANGES, GET_USER_BALANCES } from "../actions.const";

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
    displayName: "Paper Context",
    name: "exchangePaperContext",
    type: "boolean",
    required: true,
    default: false,
    description: "Paper context. Whether to use paper trading or real trading",
    displayOptions: {
      show: {
        resource: ["user"],
        operation: [GET_USER_EXCHANGES],
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
        operation: [GET_USER_BALANCES],
      },
    },
  },
  {
    displayName: "Paper Context",
    name: "balancePaperContext",
    type: "boolean",
    required: false,
    default: false,
    description: "Paper context. If not provided - all exchanges will be used. If exchange is provided - paper context will be skipped",
    displayOptions: {
      show: {
        resource: ["user"],
        operation: [GET_USER_BALANCES],
      },
    },
  },
  {
    displayName: "Page",
    name: "page",
    type: "number",
    required: false,
    default: 1,
    typeOptions: {
      minValue: 1,
    },
    description: "Page number. Results will be paginated by 500 assets",
    displayOptions: {
      show: {
        resource: ["user"],
        operation: [GET_USER_BALANCES],
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
        operation: [GET_USER_BALANCES],
      },
    },
  },
] as INodeProperties[];

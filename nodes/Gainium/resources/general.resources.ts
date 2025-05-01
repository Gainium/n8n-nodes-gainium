import { INodeProperties } from "n8n-workflow";
import { GET_SUPPORTED_EXCHANGE } from "../actions.const";

export default [
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
        value: GET_SUPPORTED_EXCHANGE,
        description: "Get Supported Exchanges",
        action: "Get Supported Exchanges",
      },
    ],
    default: GET_SUPPORTED_EXCHANGE,
  },
] as INodeProperties[];

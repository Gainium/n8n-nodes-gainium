"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v2Properties = void 0;
const FIELDS_OPTIONS = [
    { name: "Minimal", value: "minimal" },
    { name: "Standard", value: "standard" },
    { name: "Extended", value: "extended" },
    { name: "Full", value: "full" },
];
exports.v2Properties = [
    {
        displayName: "Calls Gainium API v2. Refer to the official API documentation for request/response details.",
        name: "noticeV2",
        type: "notice",
        default: "",
    },
    {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        options: [
            { name: "Bot", value: "bots" },
            { name: "Deal", value: "deals" },
            { name: "User", value: "user" },
            { name: "General", value: "general" },
        ],
        default: "bots",
        required: true,
    },
    // ======================= BOTS =======================
    {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["bots"] } },
        options: [
            {
                name: "List Bots",
                value: "list",
                action: "List bots",
                description: "Get a paginated list of bots of a given type",
            },
            {
                name: "Start Bot",
                value: "start",
                action: "Start a bot",
                description: "Start a bot",
            },
            {
                name: "Stop Bot",
                value: "stop",
                action: "Stop a bot",
                description: "Stop a bot",
            },
            {
                name: "Archive Bot",
                value: "archive",
                action: "Archive a bot",
                description: "Archive (delete) a bot",
            },
            {
                name: "Restore Bot",
                value: "restore",
                action: "Restore a bot",
                description: "Restore an archived bot",
            },
            {
                name: "Clone Bot",
                value: "clone",
                action: "Clone a bot",
                description: "Clone an existing bot",
            },
            {
                name: "Update Bot",
                value: "update",
                action: "Update a bot",
                description: "Update settings of a DCA or Combo bot",
            },
            {
                name: "Change Bot Pairs",
                value: "changePairs",
                action: "Change bot pairs",
                description: "Add, remove or replace a bot's trading pairs",
            },
        ],
        default: "list",
    },
    {
        displayName: "This operation requires write permission on the API key.",
        name: "botWriteNotice",
        type: "notice",
        default: "",
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [
                    "start",
                    "stop",
                    "archive",
                    "restore",
                    "clone",
                    "update",
                    "changePairs",
                ],
            },
        },
    },
    // Bot Type — grid/dca/combo for most ops
    {
        displayName: "Bot Type",
        name: "botType",
        type: "options",
        required: true,
        default: "dca",
        options: [
            { name: "Grid", value: "grid" },
            { name: "DCA", value: "dca" },
            { name: "Combo", value: "combo" },
        ],
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [
                    "list",
                    "start",
                    "stop",
                    "archive",
                    "restore",
                    "clone",
                    "changePairs",
                ],
            },
        },
    },
    // Bot Type — dca/combo only for update (grid bots can't be updated)
    {
        displayName: "Bot Type",
        name: "botType",
        type: "options",
        required: true,
        default: "dca",
        description: "Grid bots cannot be updated",
        options: [
            { name: "DCA", value: "dca" },
            { name: "Combo", value: "combo" },
        ],
        displayOptions: {
            show: { resource: ["bots"], operation: ["update"] },
        },
    },
    {
        displayName: "Bot ID",
        name: "botId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: {
                resource: ["bots"],
                operation: [
                    "start",
                    "stop",
                    "archive",
                    "restore",
                    "clone",
                    "update",
                    "changePairs",
                ],
            },
        },
    },
    // --- List bots ---
    {
        displayName: "Status",
        name: "status",
        type: "options",
        default: "",
        options: [
            { name: "Any", value: "" },
            { name: "Open", value: "open" },
            { name: "Closed", value: "closed" },
            { name: "Range", value: "range" },
            { name: "Error", value: "error" },
            { name: "Archive", value: "archive" },
            { name: "Monitoring", value: "monitoring" },
        ],
        displayOptions: {
            show: { resource: ["bots"], operation: ["list"] },
        },
    },
    // --- Clone ---
    {
        displayName: "New Bot Name",
        name: "cloneName",
        type: "string",
        default: "",
        description: "Optional name for the cloned bot",
        displayOptions: {
            show: { resource: ["bots"], operation: ["clone"] },
        },
    },
    // --- Update ---
    {
        displayName: "Settings (JSON)",
        name: "settings",
        type: "json",
        required: true,
        default: "{\n  \"tpPerc\": \"2\",\n  \"useTp\": true\n}",
        description: "JSON object with only the fields you want to change. Refer to the Gainium API docs.",
        displayOptions: {
            show: { resource: ["bots"], operation: ["update"] },
        },
    },
    // --- Change pairs ---
    {
        displayName: "Pairs To Set",
        name: "pairsToSet",
        type: "string",
        required: true,
        default: "",
        placeholder: "BTC_USDT,ETH_USDT",
        description: "Comma-separated list of trading pairs",
        displayOptions: {
            show: { resource: ["bots"], operation: ["changePairs"] },
        },
    },
    {
        displayName: "Mode",
        name: "pairsToSetMode",
        type: "options",
        required: true,
        default: "replace",
        options: [
            { name: "Replace", value: "replace" },
            { name: "Add", value: "add" },
            { name: "Remove", value: "remove" },
        ],
        displayOptions: {
            show: { resource: ["bots"], operation: ["changePairs"] },
        },
    },
    // --- Stop options ---
    {
        displayName: "Close Type",
        name: "closeType",
        type: "options",
        default: "leave",
        description: "For DCA and Combo bots",
        options: [
            { name: "Leave", value: "leave" },
            { name: "Cancel", value: "cancel" },
            { name: "Close By Limit", value: "closeByLimit" },
            { name: "Close By Market", value: "closeByMarket" },
        ],
        displayOptions: {
            show: { resource: ["bots"], operation: ["stop"], botType: ["dca", "combo"] },
        },
    },
    {
        displayName: "Close Grid Type",
        name: "closeGridType",
        type: "options",
        default: "cancel",
        description: "For Grid bots",
        options: [
            { name: "Cancel", value: "cancel" },
            { name: "Close By Limit", value: "closeByLimit" },
            { name: "Close By Market", value: "closeByMarket" },
        ],
        displayOptions: {
            show: { resource: ["bots"], operation: ["stop"], botType: ["grid"] },
        },
    },
    {
        displayName: "Cancel Partially Filled",
        name: "cancelPartiallyFilled",
        type: "boolean",
        default: false,
        description: "Whether to cancel partially filled orders (Grid bots)",
        displayOptions: {
            show: { resource: ["bots"], operation: ["stop"], botType: ["grid"] },
        },
    },
    // ======================= DEALS =======================
    {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["deals"] } },
        options: [
            {
                name: "List Deals",
                value: "list",
                action: "List deals",
                description: "Get a paginated list of deals of a given type",
            },
            {
                name: "Update Deal",
                value: "update",
                action: "Update a deal",
                description: "Update settings of an active deal",
            },
            {
                name: "Start Deal",
                value: "start",
                action: "Start a deal",
                description: "Open a new deal on a bot",
            },
            {
                name: "Close Deal",
                value: "close",
                action: "Close a deal",
                description: "Close or cancel a deal",
            },
            {
                name: "Manage Funds",
                value: "manageFunds",
                action: "Add or reduce deal funds",
                description: "Add funds to or reduce funds from a deal",
            },
        ],
        default: "list",
    },
    {
        displayName: "This operation requires write permission on the API key.",
        name: "dealWriteNotice",
        type: "notice",
        default: "",
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: ["update", "start", "close", "manageFunds"],
            },
        },
    },
    // Deal Type — dca/combo/terminal for list, update, close
    {
        displayName: "Deal Type",
        name: "dealType",
        type: "options",
        required: true,
        default: "dca",
        options: [
            { name: "DCA", value: "dca" },
            { name: "Combo", value: "combo" },
            { name: "Terminal", value: "terminal" },
        ],
        displayOptions: {
            show: { resource: ["deals"], operation: ["list", "update", "close"] },
        },
    },
    // Deal Type — dca/combo for start
    {
        displayName: "Deal Type",
        name: "dealType",
        type: "options",
        required: true,
        default: "dca",
        options: [
            { name: "DCA", value: "dca" },
            { name: "Combo", value: "combo" },
        ],
        displayOptions: {
            show: { resource: ["deals"], operation: ["start"] },
        },
    },
    // --- List deals ---
    {
        displayName: "Status",
        name: "status",
        type: "options",
        default: "",
        options: [
            { name: "Any", value: "" },
            { name: "Open", value: "open" },
            { name: "Closed", value: "closed" },
            { name: "Start", value: "start" },
            { name: "Error", value: "error" },
            { name: "Canceled", value: "canceled" },
        ],
        displayOptions: {
            show: { resource: ["deals"], operation: ["list"] },
        },
    },
    {
        displayName: "Bot ID",
        name: "botId",
        type: "string",
        default: "",
        description: "Optional: only return deals belonging to this bot",
        displayOptions: {
            show: { resource: ["deals"], operation: ["list"] },
        },
    },
    // --- Deal ID (update, close) ---
    {
        displayName: "Deal ID",
        name: "dealId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: { resource: ["deals"], operation: ["update", "close"] },
        },
    },
    // --- Update deal ---
    {
        displayName: "Settings (JSON)",
        name: "settings",
        type: "json",
        required: true,
        default: "{\n  \"tpPerc\": \"1.5\",\n  \"useTp\": true\n}",
        description: "JSON object with only the fields you want to change. Refer to the Gainium API docs.",
        displayOptions: {
            show: { resource: ["deals"], operation: ["update"] },
        },
    },
    // --- Start deal ---
    {
        displayName: "Bot ID",
        name: "botId",
        type: "string",
        required: true,
        default: "",
        description: "Bot to open the new deal on",
        displayOptions: {
            show: { resource: ["deals"], operation: ["start"] },
        },
    },
    {
        displayName: "Symbol",
        name: "symbol",
        type: "string",
        default: "",
        placeholder: "BTC/USDT",
        description: "Optional pair for multi-pair bots",
        displayOptions: {
            show: { resource: ["deals"], operation: ["start"] },
        },
    },
    // --- Close deal ---
    {
        displayName: "Close Type",
        name: "closeType",
        type: "options",
        required: true,
        default: "closeByMarket",
        options: [
            { name: "Close By Market", value: "closeByMarket" },
            { name: "Cancel", value: "cancel" },
        ],
        displayOptions: {
            show: { resource: ["deals"], operation: ["close"] },
        },
    },
    // --- Manage funds ---
    {
        displayName: "Operation Type",
        name: "fundsOperation",
        type: "options",
        required: true,
        default: "add-funds",
        options: [
            { name: "Add Funds", value: "add-funds" },
            { name: "Reduce Funds", value: "reduce-funds" },
        ],
        displayOptions: {
            show: { resource: ["deals"], operation: ["manageFunds"] },
        },
    },
    {
        displayName: "Deal ID",
        name: "dealId",
        type: "string",
        default: "",
        description: "Provide a Deal ID or a Bot ID (at least one)",
        displayOptions: {
            show: { resource: ["deals"], operation: ["manageFunds"] },
        },
    },
    {
        displayName: "Bot ID",
        name: "botId",
        type: "string",
        default: "",
        description: "Alternative to Deal ID",
        displayOptions: {
            show: { resource: ["deals"], operation: ["manageFunds"] },
        },
    },
    {
        displayName: "Quantity",
        name: "qty",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: { resource: ["deals"], operation: ["manageFunds"] },
        },
    },
    {
        displayName: "Type",
        name: "fundsType",
        type: "options",
        required: true,
        default: "fixed",
        options: [
            { name: "Fixed", value: "fixed" },
            { name: "Percentage", value: "perc" },
        ],
        displayOptions: {
            show: { resource: ["deals"], operation: ["manageFunds"] },
        },
    },
    {
        displayName: "Asset",
        name: "asset",
        type: "options",
        default: "quote",
        description: "Required when Type is Fixed",
        options: [
            { name: "Base", value: "base" },
            { name: "Quote", value: "quote" },
        ],
        displayOptions: {
            show: {
                resource: ["deals"],
                operation: ["manageFunds"],
                fundsType: ["fixed"],
            },
        },
    },
    {
        displayName: "Symbol",
        name: "symbol",
        type: "string",
        default: "",
        placeholder: "BTC/USDT",
        displayOptions: {
            show: { resource: ["deals"], operation: ["manageFunds"] },
        },
    },
    // ======================= USER =======================
    {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["user"] } },
        options: [
            {
                name: "List Exchanges",
                value: "exchanges",
                action: "List connected exchanges",
                description: "List the user's connected exchange accounts",
            },
            {
                name: "List Balances",
                value: "balances",
                action: "List balances",
                description: "List balances across connected exchanges",
            },
        ],
        default: "exchanges",
    },
    {
        displayName: "Exchange ID",
        name: "exchangeId",
        type: "string",
        default: "",
        description: "Optional: restrict to one connected exchange account",
        displayOptions: {
            show: { resource: ["user"], operation: ["balances"] },
        },
    },
    {
        displayName: "Assets",
        name: "assets",
        type: "string",
        default: "",
        placeholder: "BTC,ETH,USDT",
        description: "Optional: comma-separated asset symbols",
        displayOptions: {
            show: { resource: ["user"], operation: ["balances"] },
        },
    },
    // ======================= GENERAL =======================
    {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["general"] } },
        options: [
            {
                name: "Crypto Screener",
                value: "screener",
                action: "Get crypto screener",
                description: "Query the crypto screener",
            },
            {
                name: "Supported Exchanges",
                value: "supportedExchanges",
                action: "Get supported exchanges",
                description: "List exchanges supported by Gainium",
            },
            {
                name: "Custom API Call",
                value: "customApiCall",
                action: "Make a custom API call",
                description: "Make an arbitrary signed call to the Gainium API",
            },
        ],
        default: "screener",
    },
    // --- Screener ---
    {
        displayName: "Page",
        name: "screenerPage",
        type: "number",
        default: 0,
        description: "Zero-indexed page number",
        displayOptions: {
            show: { resource: ["general"], operation: ["screener"] },
        },
    },
    {
        displayName: "Page Size",
        name: "pageSize",
        type: "number",
        default: 10,
        displayOptions: {
            show: { resource: ["general"], operation: ["screener"] },
        },
    },
    {
        displayName: "Sort Field",
        name: "sortField",
        type: "string",
        default: "",
        placeholder: "marketCap",
        displayOptions: {
            show: { resource: ["general"], operation: ["screener"] },
        },
    },
    {
        displayName: "Sort Type",
        name: "sortType",
        type: "options",
        default: "",
        options: [
            { name: "None", value: "" },
            { name: "Ascending", value: "asc" },
            { name: "Descending", value: "desc" },
        ],
        displayOptions: {
            show: { resource: ["general"], operation: ["screener"] },
        },
    },
    {
        displayName: "Filter Model (JSON)",
        name: "filterModel",
        type: "json",
        default: "{}",
        description: "Optional filter, e.g. {\"items\":[{\"field\":\"marketCap\",\"operator\":\">\",\"value\":\"1000000\"}],\"linkOperator\":\"and\"}. Leave as {} for no filter.",
        displayOptions: {
            show: { resource: ["general"], operation: ["screener"] },
        },
    },
    // --- Custom API call ---
    {
        displayName: "Method",
        name: "customMethod",
        type: "options",
        default: "GET",
        options: [
            { name: "GET", value: "GET" },
            { name: "POST", value: "POST" },
            { name: "PUT", value: "PUT" },
            { name: "DELETE", value: "DELETE" },
        ],
        displayOptions: {
            show: { resource: ["general"], operation: ["customApiCall"] },
        },
    },
    {
        displayName: "Endpoint Path",
        name: "customUrl",
        type: "string",
        required: true,
        default: "",
        placeholder: "/api/v2/bots/dca?fields=standard&page=1",
        description: "Relative path including query string",
        displayOptions: {
            show: { resource: ["general"], operation: ["customApiCall"] },
        },
    },
    {
        displayName: "Body (JSON)",
        name: "customBody",
        type: "json",
        default: "{}",
        description: "Request body for POST/PUT",
        displayOptions: {
            show: {
                resource: ["general"],
                operation: ["customApiCall"],
                customMethod: ["POST", "PUT"],
            },
        },
    },
    // ======================= shared: paper / fields / pagination =======================
    // Paper Trading — selects the paper vs live account (sent as the
    // `paper-context` header). Shown for every account-scoped operation.
    {
        displayName: "Paper Trading",
        name: "paperContext",
        type: "boolean",
        default: false,
        description: "Whether to operate on the paper (demo) account instead of live",
        displayOptions: {
            show: { resource: ["bots", "deals", "user"] },
        },
    },
    {
        displayName: "Paper Trading",
        name: "paperContext",
        type: "boolean",
        default: false,
        description: "Whether to operate on the paper (demo) account instead of live",
        displayOptions: {
            show: { resource: ["general"], operation: ["customApiCall"] },
        },
    },
    {
        displayName: "Fields",
        name: "fields",
        type: "options",
        default: "standard",
        description: "Amount of detail returned per item",
        options: FIELDS_OPTIONS,
        displayOptions: {
            show: {
                resource: ["bots", "deals", "user", "general"],
                operation: ["list", "balances", "screener"],
            },
        },
    },
    {
        displayName: "Return All",
        name: "returnAll",
        type: "boolean",
        default: true,
        description: "Whether to return all results across pages",
        displayOptions: {
            show: {
                resource: ["bots", "deals", "user"],
                operation: ["list", "balances"],
            },
        },
    },
    {
        displayName: "Page",
        name: "page",
        type: "number",
        default: 1,
        description: "Page to fetch when Return All is disabled",
        displayOptions: {
            show: {
                resource: ["bots", "deals", "user"],
                operation: ["list", "balances"],
                returnAll: [false],
            },
        },
    },
];

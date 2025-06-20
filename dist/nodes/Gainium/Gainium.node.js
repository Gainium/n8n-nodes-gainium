"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gainium = void 0;
const actions_const_1 = require("./actions.const");
const bots_resources_1 = __importDefault(require("./resources/bots.resources"));
const deals_resources_1 = __importDefault(require("./resources/deals.resources"));
const general_resources_1 = __importDefault(require("./resources/general.resources"));
const user_resources_1 = __importDefault(require("./resources/user.resources"));
/**
 * HMAC SHA256 implementation using Web Crypto API
 * This works in modern browsers and Node.js without requiring the crypto module
 */
async function createHmacSha256(secret, message) {
    try {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        const messageData = encoder.encode(message);
        // Import the key for HMAC
        const cryptoKey = await globalThis.crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        // Generate the HMAC signature
        const signature = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, messageData);
        // Convert ArrayBuffer to base64 string
        const bytes = new Uint8Array(signature);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    catch (error) {
        // Fallback if Web Crypto API is not available
        throw new Error('HMAC generation failed: Web Crypto API not available');
    }
}
/**
 * Custom query string encoder to avoid using node:querystring
 */
function encodeQueryString(obj) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined) {
            params.append(key, String(value));
        }
    }
    return params.toString();
}
/**
 * Helper function to fetch all pages of data
 * @param this IExecuteFunctions
 * @param options API request options
 * @param baseUrl Base URL for the API
 * @param endpoint API endpoint
 * @param itemsFieldPath Name of the items array in the response
 * @param secret Secret for signature generation
 * @param token API token
 * @param method HTTP method
 * @param queryStringBuilder Function to build the query string for each page
 * @returns Array of all items from all pages
 */
async function fetchAllItems(options, baseUrl, endpoint, itemsFieldPath, secret, token, method, queryStringBuilder) {
    let allItems = [];
    let page = 1;
    let hasMorePages = true;
    while (hasMorePages) {
        // Update query string for the current page
        const qs = queryStringBuilder(page);
        // Update timestamp for each request
        const timestamp = Date.now();
        // Generate new signature
        const signature = await getSignature(secret, "", // For GET requests, body is empty
        method, endpoint + qs, timestamp);
        // Update options for the current page request
        const pageOptions = {
            ...options,
            url: `${baseUrl}${endpoint}${qs}`,
            headers: {
                "Content-Type": "application/json",
                Token: token,
                Time: timestamp,
                Signature: signature,
            },
        };
        // Make the request
        const response = await this.helpers.request({
            ...pageOptions,
            json: true,
        });
        if (response.status === "NOTOK") {
            throw new Error(`Error: ${response.reason}`);
        }
        console.log(`Page ${page} response:`, JSON.stringify(response, null, 2));
        // Extract items based on the field path
        let pageItems = [];
        const pathParts = itemsFieldPath.split(".");
        // Handle different response structures
        let currentObj = response;
        let foundItems = false;
        for (const part of pathParts) {
            if (currentObj && currentObj[part] !== undefined) {
                currentObj = currentObj[part];
            }
            else {
                console.log(`Path part ${part} not found in response`);
                currentObj = null;
                break;
            }
        }
        if (currentObj && Array.isArray(currentObj)) {
            pageItems = currentObj;
            foundItems = true;
            console.log(`Found ${pageItems.length} items using path ${itemsFieldPath}`);
        }
        // If we didn't find items using the specified path, try to find an array in response.data
        if (!foundItems && response.data) {
            console.log("Searching for items array in response.data:", Object.keys(response.data));
            for (const key of Object.keys(response.data)) {
                if (Array.isArray(response.data[key])) {
                    pageItems = response.data[key];
                    console.log(`Found ${pageItems.length} items in the ${key} array`);
                    foundItems = true;
                    break;
                }
            }
        }
        // If we still didn't find items, check for nested data structures
        if (!foundItems && response.data && typeof response.data === "object") {
            for (const key of Object.keys(response.data)) {
                const nestedData = response.data[key];
                if (nestedData && typeof nestedData === "object") {
                    for (const nestedKey of Object.keys(nestedData)) {
                        if (Array.isArray(nestedData[nestedKey])) {
                            pageItems = nestedData[nestedKey];
                            console.log(`Found ${pageItems.length} items in nested array data.${key}.${nestedKey}`);
                            foundItems = true;
                            break;
                        }
                    }
                    if (foundItems)
                        break;
                }
            }
        }
        // Add items to the aggregate if found
        if (pageItems && Array.isArray(pageItems) && pageItems.length > 0) {
            allItems = allItems.concat(pageItems);
        }
        else {
            console.log("No items found in this page of the response or empty array returned");
        }
        // Check if there are more pages - look for pagination info
        let nextPage = false;
        // Check for pagination in response.data
        if (response.data && response.data.pagination) {
            if (response.data.pagination.page !== undefined &&
                response.data.pagination.totalPages !== undefined &&
                response.data.pagination.page < response.data.pagination.totalPages) {
                console.log(`More pages available: Current page ${response.data.pagination.page}, Total pages ${response.data.pagination.totalPages}`);
                nextPage = true;
            }
        }
        // Standard pagination directly in response.data
        else if (response.data &&
            response.data.page !== undefined &&
            response.data.totalPages !== undefined &&
            response.data.page < response.data.totalPages) {
            console.log(`More pages available: Current page ${response.data.page}, Total pages ${response.data.totalPages}`);
            nextPage = true;
        }
        // Handle array responses with pagination in first element
        else if (Array.isArray(response) &&
            response.length > 0 &&
            response[0].pagination &&
            response[0].pagination.page !== undefined &&
            response[0].pagination.totalPages !== undefined &&
            response[0].pagination.page < response[0].pagination.totalPages) {
            console.log(`More pages available (array format): Current page ${response[0].pagination.page}, Total pages ${response[0].pagination.totalPages}`);
            nextPage = true;
        }
        if (nextPage) {
            page++;
        }
        else {
            console.log("No more pages or pagination info not found");
            hasMorePages = false;
        }
    }
    console.log(`Total items aggregated: ${allItems.length}`);
    return allItems;
}
const getSignature = async (secret, body, method, endpoint, timestamp) => {
    return await createHmacSha256(secret, (body || "") + method + endpoint + timestamp);
};
class Gainium {
    constructor() {
        this.description = {
            displayName: "Gainium",
            name: "Gainium",
            icon: "file:gainium.svg",
            group: ["transform"],
            version: 1,
            description: "Operates with official Gainium API",
            subtitle: '={{$parameter["operation"] || $parameter["resource"] || "Gainium API"}}',
            defaults: {
                name: "Gainium API",
            },
            inputs: ["main"],
            outputs: ["main"],
            // @ts-ignore
            usableAsTool: true,
            credentials: [
                {
                    name: "gainiumApi",
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: "Please refer to official documentation of Gainium API for request formats.",
                    name: "caution",
                    type: "notice",
                    default: "",
                },
                {
                    displayName: "Resource",
                    name: "resource",
                    type: "options",
                    noDataExpression: true,
                    options: [
                        {
                            name: "General",
                            value: "general",
                        },
                        {
                            name: "Bots",
                            value: "bots",
                        },
                        {
                            name: "Deals",
                            value: "deals",
                        },
                        {
                            name: "User",
                            value: "user",
                        },
                    ],
                    default: "general",
                    required: true,
                },
                ...bots_resources_1.default,
                ...deals_resources_1.default,
                ...user_resources_1.default,
                ...general_resources_1.default,
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            try {
                // First, make sure we can get the resource parameter
                let resource;
                try {
                    resource = this.getNodeParameter("resource", i);
                }
                catch (error) {
                    // If we can't get the resource, default to "general"
                    resource = "general";
                    console.log("Could not get resource parameter, defaulting to 'general'");
                }
                // Now get the operation with explicit handling for each resource
                let operation;
                if (resource === "user") {
                    try {
                        operation = this.getNodeParameter("operation", i);
                    }
                    catch (error) {
                        // When triggered by Telegram for user resource, default to GET_USER_EXCHANGES
                        operation = actions_const_1.GET_USER_EXCHANGES;
                        console.log("Setting default operation for user resource: GET_USER_EXCHANGES");
                    }
                }
                else if (resource === "general") {
                    try {
                        operation = this.getNodeParameter("operation", i);
                    }
                    catch (error) {
                        operation = actions_const_1.GET_SUPPORTED_EXCHANGE;
                        console.log("Setting default operation for general resource: GET_SUPPORTED_EXCHANGE");
                    }
                }
                else if (resource === "bots") {
                    try {
                        operation = this.getNodeParameter("operation", i);
                    }
                    catch (error) {
                        operation = actions_const_1.GET_USER_GRID_BOTS;
                        console.log("Setting default operation for bots resource: GET_USER_GRID_BOTS");
                    }
                }
                else if (resource === "deals") {
                    try {
                        operation = this.getNodeParameter("operation", i);
                    }
                    catch (error) {
                        operation = actions_const_1.GET_USER_DEALS;
                        console.log("Setting default operation for deals resource: GET_USER_DEALS");
                    }
                }
                else {
                    try {
                        operation = this.getNodeParameter("operation", i);
                    }
                    catch (error) {
                        throw new Error(`Could not determine operation for resource: ${resource}`);
                    }
                }
                const credentials = await this.getCredentials("gainiumApi");
                const baseUrl = credentials.base_url;
                const token = credentials.token;
                const secret = credentials.secret;
                let endpoint;
                let method;
                let body;
                let signature;
                let timestamp;
                let qs = "";
                let botId;
                let botType;
                let cancelPartiallyFilled;
                let closeType;
                let closeGridType;
                let botSettings;
                let botName;
                let pairsToChange;
                let pairsToSet;
                let pairsToSetMode;
                let terminal;
                let page;
                let status;
                let paperContext;
                let pageNumber;
                let dealId;
                let dealSettings;
                let qty;
                let asset;
                let symbol;
                let type;
                let close_type;
                let options = {};
                // Always generate timestamp at the start of each item
                timestamp = Date.now();
                switch (resource) {
                    case "bots":
                        switch (operation) {
                            case actions_const_1.GET_USER_GRID_BOTS:
                                status = this.getNodeParameter("status", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                endpoint = "/api/bots/grid";
                                method = "GET";
                                // For GET, do not send a body
                                body = "";
                                const returnAllGridBots = this.getNodeParameter("returnAll", i, true);
                                if (returnAllGridBots) {
                                    // First make a request to see the actual structure
                                    qs = `?${status ? `status=${status}&` : ""}paperContext=${paperContext}&page=1`;
                                    signature = await getSignature(secret, body, method, endpoint + qs, timestamp);
                                    const initialResponse = await this.helpers.request({
                                        url: `${baseUrl}${endpoint}${qs}`,
                                        method,
                                        headers: {
                                            "Content-Type": "application/json",
                                            Token: token,
                                            Time: timestamp,
                                            Signature: signature,
                                        },
                                        json: true,
                                    });
                                    console.log("Initial response structure:", JSON.stringify(initialResponse, null, 2));
                                    // Determine the correct items path based on response structure
                                    let itemsPath = "data.items";
                                    if (initialResponse.data && initialResponse.data.result) {
                                        itemsPath = "data.result";
                                    }
                                    else if (initialResponse.data &&
                                        !initialResponse.data.items) {
                                        // Find the first array in the response data
                                        for (const key in initialResponse.data) {
                                            if (Array.isArray(initialResponse.data[key])) {
                                                itemsPath = `data.${key}`;
                                                break;
                                            }
                                        }
                                    }
                                    const gridBotsResponse = await fetchAllItems.call(this, {
                                        method,
                                        headers: {
                                            "Content-Type": "application/json",
                                            Token: token,
                                        },
                                    }, baseUrl, endpoint, itemsPath, secret, token, method, (pageNum) => `?${status ? `status=${status}&` : ""}paperContext=${paperContext}&page=${pageNum}`);
                                    // Format the response with the same structure as received
                                    const responseData = initialResponse.data && initialResponse.data.result
                                        ? {
                                            result: gridBotsResponse,
                                            totalResults: gridBotsResponse.length,
                                        }
                                        : {
                                            items: gridBotsResponse,
                                            itemsCount: gridBotsResponse.length,
                                        };
                                    returnData.push({
                                        json: {
                                            data: responseData,
                                        },
                                    });
                                    continue;
                                }
                                pageNumber = this.getNodeParameter("pageNumber", i);
                                qs = `?${status ? `status=${status}&` : ""}paperContext=${paperContext}&page=${pageNumber}`;
                                signature = await getSignature(secret, body, method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.GET_USER_COMBO_BOTS:
                                status = this.getNodeParameter("status", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                endpoint = "/api/bots/combo";
                                method = "GET";
                                body = "";
                                const returnAllComboBots = this.getNodeParameter("returnAll", i, true);
                                if (returnAllComboBots) {
                                    // First make a request to see the actual structure
                                    qs = `?${status ? `status=${status}&` : ""}paperContext=${paperContext}&page=1`;
                                    signature = await getSignature(secret, body, method, endpoint + qs, timestamp);
                                    const initialResponse = await this.helpers.request({
                                        url: `${baseUrl}${endpoint}${qs}`,
                                        method,
                                        headers: {
                                            "Content-Type": "application/json",
                                            Token: token,
                                            Time: timestamp,
                                            Signature: signature,
                                        },
                                        json: true,
                                    });
                                    console.log("Initial combo bots response structure:", JSON.stringify(initialResponse, null, 2));
                                    // Determine the correct items path based on response structure
                                    let itemsPath = "data.items";
                                    if (initialResponse.data && initialResponse.data.result) {
                                        itemsPath = "data.result";
                                    }
                                    else if (initialResponse.data &&
                                        !initialResponse.data.items) {
                                        // Find the first array in the response data
                                        for (const key in initialResponse.data) {
                                            if (Array.isArray(initialResponse.data[key])) {
                                                itemsPath = `data.${key}`;
                                                break;
                                            }
                                        }
                                    }
                                    const comboBotsResponse = await fetchAllItems.call(this, {
                                        method,
                                        headers: {
                                            "Content-Type": "application/json",
                                            Token: token,
                                        },
                                    }, baseUrl, endpoint, itemsPath, secret, token, method, (pageNum) => `?${status ? `status=${status}&` : ""}paperContext=${paperContext}&page=${pageNum}`);
                                    // Format the response with the same structure as received
                                    const responseData = initialResponse.data && initialResponse.data.result
                                        ? {
                                            result: comboBotsResponse,
                                            totalResults: comboBotsResponse.length,
                                        }
                                        : {
                                            items: comboBotsResponse,
                                            itemsCount: comboBotsResponse.length,
                                        };
                                    returnData.push({
                                        json: {
                                            data: responseData,
                                        },
                                    });
                                    continue;
                                }
                                pageNumber = this.getNodeParameter("pageNumber", i);
                                qs = `?${status ? `status=${status}&` : ""}paperContext=${paperContext}&page=${pageNumber}`;
                                signature = await getSignature(secret, body, method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.GET_USER_DCA_BOTS:
                                status = this.getNodeParameter("status", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                endpoint = "/api/bots/dca";
                                method = "GET";
                                body = "";
                                const returnAllDcaBots = this.getNodeParameter("returnAll", i, true);
                                if (returnAllDcaBots) {
                                    // First make a request to see the actual structure
                                    qs = `?${status ? `status=${status}&` : ""}paperContext=${paperContext}&page=1`;
                                    signature = await getSignature(secret, body, method, endpoint + qs, timestamp);
                                    const initialResponse = await this.helpers.request({
                                        url: `${baseUrl}${endpoint}${qs}`,
                                        method,
                                        headers: {
                                            "Content-Type": "application/json",
                                            Token: token,
                                            Time: timestamp,
                                            Signature: signature,
                                        },
                                        json: true,
                                    });
                                    console.log("Initial DCA bots response structure:", JSON.stringify(initialResponse, null, 2));
                                    // Determine the correct items path based on response structure
                                    let itemsPath = "data.items";
                                    if (initialResponse.data && initialResponse.data.result) {
                                        itemsPath = "data.result";
                                    }
                                    else if (initialResponse.data &&
                                        !initialResponse.data.items) {
                                        // Find the first array in the response data
                                        for (const key in initialResponse.data) {
                                            if (Array.isArray(initialResponse.data[key])) {
                                                itemsPath = `data.${key}`;
                                                break;
                                            }
                                        }
                                    }
                                    const dcaBotsResponse = await fetchAllItems.call(this, {
                                        method,
                                        headers: {
                                            "Content-Type": "application/json",
                                            Token: token,
                                        },
                                    }, baseUrl, endpoint, itemsPath, secret, token, method, (pageNum) => `?${status ? `status=${status}&` : ""}paperContext=${paperContext}&page=${pageNum}`);
                                    // Format the response with the same structure as received
                                    const responseData = initialResponse.data && initialResponse.data.result
                                        ? {
                                            result: dcaBotsResponse,
                                            totalResults: dcaBotsResponse.length,
                                        }
                                        : {
                                            items: dcaBotsResponse,
                                            itemsCount: dcaBotsResponse.length,
                                        };
                                    returnData.push({
                                        json: {
                                            data: responseData,
                                        },
                                    });
                                    continue;
                                }
                                pageNumber = this.getNodeParameter("pageNumber", i);
                                qs = `?${status ? `status=${status}&` : ""}paperContext=${paperContext}&page=${pageNumber}`;
                                signature = await getSignature(secret, body, method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.UPDATE_DCA_BOT_SETTINGS:
                                botId = this.getNodeParameter("botId", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                botSettings = this.getNodeParameter("botSettings", i);
                                endpoint = "/api/updateDCABot";
                                method = "POST";
                                body = JSON.parse(botSettings);
                                qs = `?botId=${botId}&paperContext=${paperContext}`;
                                signature = await getSignature(secret, JSON.stringify(body), method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.CLONE_DCA_BOT:
                                botId = this.getNodeParameter("botId", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                botSettings = this.getNodeParameter("botSettings", i);
                                endpoint = "/api/cloneDCABot";
                                method = "PUT";
                                body = JSON.parse(botSettings);
                                qs = `?botId=${botId}&paperContext=${paperContext}`;
                                signature = await getSignature(secret, JSON.stringify(body), method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.UPDATE_COMBO_BOT_SETTINGS:
                                botId = this.getNodeParameter("botId", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                botSettings = this.getNodeParameter("botSettings", i);
                                endpoint = "/api/updateComboBot";
                                method = "POST";
                                body = JSON.parse(botSettings);
                                qs = `?botId=${botId}&paperContext=${paperContext}`;
                                signature = await getSignature(secret, JSON.stringify(body), method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.CLONE_COMBO_BOT:
                                botId = this.getNodeParameter("botId", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                botSettings = this.getNodeParameter("botSettings", i);
                                endpoint = "/api/cloneComboBot";
                                method = "PUT";
                                body = JSON.parse(botSettings);
                                qs = `?botId=${botId}&paperContext=${paperContext}`;
                                signature = await getSignature(secret, JSON.stringify(body), method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.CHANGE_BOT_PAIRS:
                                botId = this.getNodeParameter("botId", i);
                                botName = this.getNodeParameter("botName", i);
                                try {
                                    pairsToChange = this.getNodeParameter("options.pairsToChange.pairsToChange", i);
                                }
                                catch (e) {
                                    pairsToChange = "{}";
                                }
                                pairsToChange = JSON.parse(pairsToChange);
                                pairsToSet = this.getNodeParameter("pairsToSet", i);
                                // Convert comma-separated string to array
                                pairsToSet = pairsToSet.split(",").map((pair) => pair.trim());
                                pairsToSetMode = this.getNodeParameter("pairsToSetMode", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                endpoint = "/api/changeBotPairs";
                                method = "POST";
                                body = {
                                    botId,
                                    botName,
                                    ...(Object.keys(pairsToChange).length === 0
                                        ? {}
                                        : { pairsToChange }),
                                    pairsToSet,
                                    pairsToSetMode,
                                    paperContext,
                                };
                                qs = encodeQueryString(body);
                                signature = await getSignature(secret, JSON.stringify(body), method, `${endpoint}?${qs}`, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}?${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.START_BOT:
                                botId = this.getNodeParameter("botId", i);
                                botType = this.getNodeParameter("botType", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                endpoint = "/api/startBot";
                                method = "POST";
                                body = JSON.stringify({
                                    botId,
                                    type: botType,
                                    paperContext,
                                });
                                qs = `?botId=${botId}&type=${botType}&paperContext=${paperContext}`;
                                signature = await getSignature(secret, body, method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.RESTORE_BOT:
                                botId = this.getNodeParameter("botId", i);
                                botType = this.getNodeParameter("botType", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                endpoint = "/api/restoreBot";
                                method = "POST";
                                body = JSON.stringify({
                                    botId,
                                    type: botType,
                                    paperContext,
                                });
                                qs = `?botId=${botId}&type=${botType}&paperContext=${paperContext}`;
                                signature = await getSignature(secret, body, method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.STOP_BOT:
                                botId = this.getNodeParameter("botId", i);
                                botType = this.getNodeParameter("botType", i);
                                if (botType === "grid") {
                                    cancelPartiallyFilled = this.getNodeParameter("cancelPartiallyFilled", i);
                                    closeGridType = this.getNodeParameter("closeGridType", i);
                                }
                                if (botType === "dca") {
                                    closeType = this.getNodeParameter("closeType", i);
                                }
                                paperContext = this.getNodeParameter("paperContext", i);
                                endpoint = "/api/stopBot";
                                method = "DELETE";
                                body = JSON.stringify({
                                    botId,
                                    botType,
                                    ...(cancelPartiallyFilled === undefined
                                        ? {}
                                        : { cancelPartiallyFilled }),
                                    ...(closeType === undefined ? {} : { closeType }),
                                    ...(closeGridType === undefined ? {} : { closeGridType }),
                                    paperContext,
                                });
                                qs = `?botId=${botId}&botType=${botType}${cancelPartiallyFilled !== undefined
                                    ? `&cancelPartiallyFilled=${cancelPartiallyFilled}`
                                    : ""}${closeType !== undefined ? `&closeType=${closeType}` : ""}${closeGridType !== undefined
                                    ? `&closeGridType=${closeGridType}`
                                    : ""}&paperContext=${paperContext}`;
                                signature = await getSignature(secret, body, method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.ARCHIVE_BOT:
                                botId = this.getNodeParameter("botId", i);
                                botType = this.getNodeParameter("botType", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                endpoint = "/api/archiveBot";
                                method = "DELETE";
                                body = JSON.stringify({
                                    botId,
                                    botType,
                                    paperContext,
                                });
                                qs = `?botId=${botId}&botType=${botType}&paperContext=${paperContext}`;
                                signature = await getSignature(secret, body, method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            default:
                                throw new Error(`Operation ${operation} is not supported`);
                        }
                        break;
                    case "deals":
                        switch (operation) {
                            case actions_const_1.GET_USER_DEALS:
                                status = this.getNodeParameter("status", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                terminal = this.getNodeParameter("terminal", i);
                                botId = this.getNodeParameter("botId", i);
                                botType = this.getNodeParameter("botType", i);
                                endpoint = "/api/deals";
                                method = "GET";
                                body = "";
                                const returnAllDeals = this.getNodeParameter("returnAll", i, true);
                                if (returnAllDeals) {
                                    // First make a request to see the actual structure
                                    const dealsQueryObj = {
                                        status,
                                        paperContext,
                                        terminal,
                                        page: 1,
                                        botId,
                                        botType,
                                    };
                                    const initialQs = encodeQueryString(dealsQueryObj);
                                    signature = await getSignature(secret, body, method, `${endpoint}?${initialQs}`, timestamp);
                                    const initialResponse = await this.helpers.request({
                                        url: `${baseUrl}${endpoint}?${initialQs}`,
                                        method,
                                        headers: {
                                            "Content-Type": "application/json",
                                            Token: token,
                                            Time: timestamp,
                                            Signature: signature,
                                        },
                                        json: true,
                                    });
                                    console.log("Initial deals response structure:", JSON.stringify(initialResponse, null, 2));
                                    // Determine the correct items path based on response structure
                                    let itemsPath = "data.items";
                                    if (initialResponse.data && initialResponse.data.result) {
                                        itemsPath = "data.result";
                                    }
                                    else if (initialResponse.data &&
                                        !initialResponse.data.items) {
                                        // Find the first array in the response data
                                        for (const key in initialResponse.data) {
                                            if (Array.isArray(initialResponse.data[key])) {
                                                itemsPath = `data.${key}`;
                                                break;
                                            }
                                        }
                                    }
                                    const dealsResponse = await fetchAllItems.call(this, {
                                        method,
                                        headers: {
                                            "Content-Type": "application/json",
                                            Token: token,
                                        },
                                    }, baseUrl, endpoint, itemsPath, secret, token, method, (pageNum) => {
                                        const queryObj = {
                                            status,
                                            paperContext,
                                            terminal,
                                            page: pageNum,
                                            botId,
                                            botType,
                                        };
                                        return "?" + encodeQueryString(queryObj);
                                    });
                                    // Format the response with the same structure as received
                                    const responseData = initialResponse.data && initialResponse.data.result
                                        ? {
                                            result: dealsResponse,
                                            totalResults: dealsResponse.length,
                                        }
                                        : {
                                            items: dealsResponse,
                                            itemsCount: dealsResponse.length,
                                        };
                                    returnData.push({
                                        json: {
                                            data: responseData,
                                        },
                                    });
                                    continue;
                                }
                                page = this.getNodeParameter("pageNumber", i);
                                const dealsQueryObj = {
                                    status,
                                    paperContext,
                                    terminal,
                                    page,
                                    botId,
                                    botType,
                                };
                                qs = encodeQueryString(dealsQueryObj);
                                signature = await getSignature(secret, body, method, `${endpoint}?${qs}`, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}?${qs}`,
                                    method,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.UPDATE_DCA_DEAL:
                                dealId = this.getNodeParameter("dealId", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                dealSettings = this.getNodeParameter("dealSettings", i);
                                endpoint = "/api/updateDCADeal";
                                method = "POST";
                                body = JSON.parse(dealSettings);
                                qs = `?dealId=${dealId}&paperContext=${paperContext}`;
                                signature = await getSignature(secret, JSON.stringify(body), method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.UPDATE_COMBO_DEAL:
                                dealId = this.getNodeParameter("dealId", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                dealSettings = this.getNodeParameter("dealSettings", i);
                                endpoint = "/api/updateComboDeal";
                                method = "POST";
                                body = JSON.parse(dealSettings);
                                qs = `?dealId=${dealId}&paperContext=${paperContext}`;
                                signature = await getSignature(secret, JSON.stringify(body), method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.ADD_FUNDS_TO_DEAL:
                                dealId = this.getNodeParameter("dealId", i);
                                botId = this.getNodeParameter("botId", i);
                                qty = this.getNodeParameter("qty", i);
                                asset = this.getNodeParameter("asset", i);
                                symbol = this.getNodeParameter("symbol", i);
                                type = this.getNodeParameter("type", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                endpoint = "/api/addFunds";
                                method = "POST";
                                body = {
                                    dealId,
                                    botId,
                                    qty,
                                    asset,
                                    symbol,
                                    type,
                                    paperContext,
                                };
                                qs = encodeQueryString(body);
                                signature = await getSignature(secret, JSON.stringify(body), method, `${endpoint}?${qs}`, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}?${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.REDUCE_FUNDS_FROM_DEAL:
                                dealId = this.getNodeParameter("dealId", i);
                                botId = this.getNodeParameter("botId", i);
                                qty = this.getNodeParameter("qty", i);
                                asset = this.getNodeParameter("asset", i);
                                symbol = this.getNodeParameter("symbol", i);
                                type = this.getNodeParameter("type", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                endpoint = "/api/reduceFunds";
                                method = "POST";
                                body = {
                                    dealId,
                                    botId,
                                    qty,
                                    asset,
                                    symbol,
                                    type,
                                    paperContext,
                                };
                                qs = encodeQueryString(body);
                                signature = await getSignature(secret, JSON.stringify(body), method, `${endpoint}?${qs}`, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}?${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.START_DEAL:
                                botId = this.getNodeParameter("botId", i);
                                symbol = this.getNodeParameter("symbol", i);
                                botType = this.getNodeParameter("botType", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                endpoint = "/api/startDeal";
                                method = "POST";
                                body = {
                                    botId,
                                    symbol,
                                    botType,
                                    paperContext,
                                };
                                qs = encodeQueryString(body);
                                signature = await getSignature(secret, JSON.stringify(body), method, `${endpoint}?${qs}`, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}?${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.CLOSE_DEAL:
                                dealId = this.getNodeParameter("dealId", i);
                                close_type = this.getNodeParameter("close_type", i);
                                type = this.getNodeParameter("botType", i);
                                paperContext = this.getNodeParameter("paperContext", i);
                                endpoint = `/api/closeDeal/${dealId}`;
                                method = "DELETE";
                                body = {
                                    type: close_type,
                                    botType: type,
                                    paperContext,
                                };
                                qs = encodeQueryString(body);
                                signature = await getSignature(secret, JSON.stringify(body), method, `${endpoint}?${qs}`, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}?${qs}`,
                                    method,
                                    body,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            default:
                                throw new Error(`Operation ${operation} is not supported`);
                        }
                        break;
                    case "user":
                        switch (operation) {
                            case actions_const_1.GET_USER_EXCHANGES:
                                // For Telegram triggers, ensure we initialize paperContext with default value
                                // when we can't get it directly
                                try {
                                    paperContext = this.getNodeParameter("exchangePaperContext", i);
                                }
                                catch (error) {
                                    // Default to false as specified in user.resources.ts
                                    paperContext = false;
                                    console.log("paperContext parameter not found, using default: false");
                                }
                                endpoint = "/api/user/exchanges";
                                method = "GET";
                                body = "";
                                qs = `?paperContext=${paperContext}`;
                                signature = await getSignature(secret, body, method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.GET_USER_BALANCES:
                                let exchangeId = "";
                                try {
                                    exchangeId = this.getNodeParameter("exchangeId", i);
                                }
                                catch (e) {
                                    // Optional parameter
                                }
                                let balancePaperContext = false;
                                try {
                                    balancePaperContext = this.getNodeParameter("balancePaperContext", i);
                                }
                                catch (e) {
                                    // Optional parameter
                                }
                                let assets = "";
                                try {
                                    assets = this.getNodeParameter("assets", i);
                                }
                                catch (e) {
                                    // Optional parameter
                                }
                                endpoint = "/api/user/balances";
                                method = "GET";
                                body = "";
                                const returnAllBalances = this.getNodeParameter("returnAll", i, true);
                                if (returnAllBalances) {
                                    // This implementation fetches all pages of balances by checking if
                                    // the current page has fewer than 500 items, indicating it's the last page
                                    let allBalances = [];
                                    let page = 1;
                                    let hasMorePages = true;
                                    let currentPageSize = 0;
                                    const PAGE_SIZE_THRESHOLD = 500; // Each page has up to 500 items
                                    console.log(`Starting to fetch all balances, paging through results...`);
                                    // Continue fetching pages until we get fewer than 500 items or error occurs
                                    while (hasMorePages) {
                                        // Construct query params for this page
                                        let queryParams = [];
                                        if (exchangeId)
                                            queryParams.push(`exchangeId=${exchangeId}`);
                                        if (balancePaperContext !== undefined)
                                            queryParams.push(`paperContext=${balancePaperContext}`);
                                        if (assets)
                                            queryParams.push(`assets=${encodeURIComponent(assets)}`);
                                        queryParams.push(`page=${page}`);
                                        queryParams.push(`pageSize=${PAGE_SIZE_THRESHOLD}`); // Explicitly request page size
                                        const pageQs = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
                                        // Generate signature for this request
                                        const pageTimestamp = Date.now();
                                        const pageSignature = await getSignature(secret, body, method, endpoint + pageQs, pageTimestamp);
                                        try {
                                            console.log(`Fetching balances page ${page}...`);
                                            // Make the request for this page
                                            const pageResponse = await this.helpers.request({
                                                url: `${baseUrl}${endpoint}${pageQs}`,
                                                method,
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    Token: token,
                                                    Time: pageTimestamp,
                                                    Signature: pageSignature,
                                                },
                                                json: true,
                                            });
                                            console.log(`Page ${page} response structure: ${JSON.stringify(pageResponse ? typeof pageResponse : "undefined")}`);
                                            // Handle the unique array-based response structure for balances
                                            if (Array.isArray(pageResponse)) {
                                                // The response is an array, check if it has the expected structure
                                                if (pageResponse.length > 0) {
                                                    // Extract the data array from the first element
                                                    const firstElement = pageResponse[0];
                                                    if (firstElement &&
                                                        firstElement.data &&
                                                        Array.isArray(firstElement.data)) {
                                                        // Get the data for this page
                                                        const pageData = firstElement.data;
                                                        currentPageSize = pageData.length;
                                                        console.log(`Page ${page} contains ${currentPageSize} items`);
                                                        // Add the items to our collection
                                                        allBalances = allBalances.concat(pageData);
                                                        // Check for explicit pagination info
                                                        if (firstElement.pagination) {
                                                            const pagination = firstElement.pagination;
                                                            if (pagination.page !== undefined &&
                                                                pagination.totalPages !== undefined &&
                                                                pagination.page < pagination.totalPages) {
                                                                // There are more pages according to pagination info
                                                                console.log(`More pages available based on pagination info: ${pagination.page}/${pagination.totalPages}`);
                                                                page++;
                                                                continue;
                                                            }
                                                        }
                                                        // If no explicit pagination or no more pages, use page size to determine if more pages exist
                                                        if (currentPageSize >= PAGE_SIZE_THRESHOLD) {
                                                            // We received a full page, which means there might be more data
                                                            console.log(`Page ${page} contains ${currentPageSize} items (equal to threshold), checking for more pages...`);
                                                            page++;
                                                        }
                                                        else {
                                                            // We received fewer items than the threshold, this is likely the last page
                                                            console.log(`Page ${page} has fewer than ${PAGE_SIZE_THRESHOLD} items (${currentPageSize}), no more pages needed`);
                                                            hasMorePages = false;
                                                        }
                                                    }
                                                    else {
                                                        // The first element doesn't have a data array
                                                        console.log(`Response is an array but doesn't match expected structure, stopping pagination`);
                                                        console.log(`First element structure: ${JSON.stringify(firstElement
                                                            ? Object.keys(firstElement)
                                                            : "undefined")}`);
                                                        hasMorePages = false;
                                                    }
                                                }
                                                else {
                                                    // Empty array response
                                                    console.log(`Received empty array response on page ${page}, stopping pagination`);
                                                    hasMorePages = false;
                                                }
                                            }
                                            else if (pageResponse && pageResponse.data) {
                                                // Alternative format where data is directly in the response object
                                                let dataArray = [];
                                                // Try to find the data array
                                                if (Array.isArray(pageResponse.data)) {
                                                    dataArray = pageResponse.data;
                                                }
                                                else if (pageResponse.data.data &&
                                                    Array.isArray(pageResponse.data.data)) {
                                                    dataArray = pageResponse.data.data;
                                                }
                                                if (dataArray.length > 0) {
                                                    currentPageSize = dataArray.length;
                                                    console.log(`Page ${page} contains ${currentPageSize} items (alternative format)`);
                                                    // Add the items to our collection
                                                    allBalances = allBalances.concat(dataArray);
                                                    // Check for pagination in direct response
                                                    if (pageResponse.data.pagination) {
                                                        const pagination = pageResponse.data.pagination;
                                                        if (pagination.page !== undefined &&
                                                            pagination.totalPages !== undefined &&
                                                            pagination.page < pagination.totalPages) {
                                                            // There are more pages according to pagination info
                                                            console.log(`More pages available based on pagination info: ${pagination.page}/${pagination.totalPages}`);
                                                            page++;
                                                            continue;
                                                        }
                                                    }
                                                    // Use page size to determine if more pages exist
                                                    if (currentPageSize >= PAGE_SIZE_THRESHOLD) {
                                                        page++;
                                                    }
                                                    else {
                                                        hasMorePages = false;
                                                    }
                                                }
                                                else {
                                                    // Empty data array
                                                    console.log(`Received empty data array on page ${page}, stopping pagination`);
                                                    hasMorePages = false;
                                                }
                                            }
                                            else {
                                                // Unexpected response format
                                                console.log(`Unexpected response format on page ${page}, stopping pagination`);
                                                console.log(`Response structure: ${JSON.stringify(pageResponse
                                                    ? Object.keys(pageResponse)
                                                    : "undefined")}`);
                                                hasMorePages = false;
                                            }
                                        }
                                        catch (error) {
                                            console.log(`Error fetching page ${page}: ${error}`);
                                            hasMorePages = false;
                                        }
                                    }
                                    console.log(`Total balances aggregated: ${allBalances.length}`);
                                    // Create a cleaner response object with all balance items directly in a data array
                                    const responseObject = {
                                        data: allBalances,
                                        pagination: {
                                            page: page,
                                            totalPages: page,
                                            totalResults: allBalances.length,
                                        },
                                    };
                                    returnData.push({
                                        json: responseObject,
                                    });
                                    continue;
                                }
                                let balancePage = 1;
                                try {
                                    balancePage = this.getNodeParameter("pageNumber", i);
                                }
                                catch (e) {
                                    // Optional parameter
                                }
                                // Construct query string with only provided parameters
                                let queryParams = [];
                                if (exchangeId)
                                    queryParams.push(`exchangeId=${exchangeId}`);
                                if (balancePaperContext !== undefined)
                                    queryParams.push(`paperContext=${balancePaperContext}`);
                                if (balancePage)
                                    queryParams.push(`page=${balancePage}`);
                                if (assets)
                                    queryParams.push(`assets=${encodeURIComponent(assets)}`);
                                qs = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
                                signature = await getSignature(secret, body, method, endpoint + qs, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}${qs}`,
                                    method,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            default:
                                throw new Error(`Operation ${operation} is not supported`);
                        }
                        break;
                    case "general":
                        switch (operation) {
                            case actions_const_1.GET_SUPPORTED_EXCHANGE:
                                endpoint = "/api/exchanges";
                                method = "GET";
                                body = "";
                                signature = await getSignature(secret, body, method, endpoint, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}`,
                                    method,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            case actions_const_1.GET_CRYPTO_SCREENER:
                                // Build query parameters for screener
                                const screenerParams = {};
                                const page = this.getNodeParameter("page", i);
                                const pageSize = this.getNodeParameter("pageSize", i);
                                const sortField = this.getNodeParameter("sortField", i);
                                const sortType = this.getNodeParameter("sortType", i);
                                const enableFilter = this.getNodeParameter("enableFilter", i);
                                const filterModel = enableFilter ? this.getNodeParameter("filterModel", i) : "";
                                if (page !== undefined)
                                    screenerParams.page = page;
                                if (pageSize !== undefined)
                                    screenerParams.pageSize = pageSize;
                                if (sortField)
                                    screenerParams.sortField = sortField;
                                if (sortType)
                                    screenerParams.sortType = sortType;
                                if (enableFilter && filterModel) {
                                    try {
                                        screenerParams.filterModel = JSON.parse(filterModel);
                                    }
                                    catch (error) {
                                        throw new Error(`Invalid JSON in filterModel: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                    }
                                }
                                const screenerQs = Object.keys(screenerParams).length > 0
                                    ? `?${new URLSearchParams(Object.entries(screenerParams).reduce((acc, [key, value]) => {
                                        if (key === 'filterModel' && typeof value === 'object') {
                                            acc[key] = JSON.stringify(value);
                                        }
                                        else {
                                            acc[key] = String(value);
                                        }
                                        return acc;
                                    }, {})).toString()}`
                                    : "";
                                endpoint = `/api/screener${screenerQs}`;
                                method = "GET";
                                body = "";
                                signature = await getSignature(secret, body, method, endpoint, timestamp);
                                options = {
                                    url: `${baseUrl}${endpoint}`,
                                    method,
                                    headers: {
                                        "Content-Type": "application/json",
                                        Token: token,
                                        Time: timestamp,
                                        Signature: signature,
                                    },
                                };
                                break;
                            default:
                                throw new Error(`Operation ${operation} is not supported`);
                        }
                }
                const response = await this.helpers.request({
                    ...options,
                    json: true,
                });
                if (response.status === "NOTOK")
                    throw new Error(`Error: ${response.reason}`);
                // Special handling for GET_USER_BALANCES to ensure consistent format
                if (resource === "user" && operation === actions_const_1.GET_USER_BALANCES) {
                    let balancesData = [];
                    // Process the array-based response format
                    if (Array.isArray(response) &&
                        response.length > 0 &&
                        response[0].data) {
                        balancesData = response[0].data;
                        // Create a clean response structure
                        returnData.push({
                            json: {
                                data: balancesData,
                                pagination: response[0].pagination || {
                                    page: 1,
                                    totalPages: 1,
                                    totalResults: balancesData.length,
                                },
                            },
                        });
                    }
                    else {
                        // Fallback if response doesn't match expected format
                        returnData.push({ json: { data: response.data || response } });
                    }
                }
                else {
                    // Standard handling for other operations
                    returnData.push({ json: { data: response.data } });
                }
            }
            catch (e) {
                console.log(e);
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: e.message } });
                    continue;
                }
                else {
                    throw e;
                }
            }
        }
        return [returnData];
    }
}
exports.Gainium = Gainium;

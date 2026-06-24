"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GainiumV2 = void 0;
const GenericFunctions_1 = require("../GenericFunctions");
const descriptions_1 = require("./descriptions");
class GainiumV2 {
    constructor(baseDescription) {
        this.description = {
            ...baseDescription,
            version: 2,
            description: "Operates with the official Gainium API (v2)",
            subtitle: "={{$parameter[\"operation\"] + \": \" + $parameter[\"resource\"]}}",
            defaults: { name: "Gainium" },
            inputs: ["main" /* NodeConnectionType.Main */],
            outputs: ["main" /* NodeConnectionType.Main */],
            // @ts-ignore - usableAsTool is supported at runtime
            usableAsTool: true,
            credentials: [{ name: "gainiumApi", required: true }],
            properties: descriptions_1.v2Properties,
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const pushItems = (data) => {
            for (const entry of data) {
                returnData.push({ json: entry });
            }
        };
        for (let i = 0; i < items.length; i++) {
            try {
                const resource = this.getNodeParameter("resource", i);
                const operation = this.getNodeParameter("operation", i);
                // Paper vs live account — sent as the `paper-context` header on every
                // account-scoped call (default false on ops where it isn't shown).
                const paper = this.getNodeParameter("paperContext", i, false);
                const ctx = this;
                const api = (method, path, body) => GenericFunctions_1.gainiumApiRequest.call(ctx, method, path, body, paper);
                const apiAll = (buildPath) => GenericFunctions_1.gainiumApiRequestAllItems.call(ctx, buildPath, paper);
                // ----- list/paginated helper -----
                const handleList = async (buildPath) => {
                    const returnAll = this.getNodeParameter("returnAll", i);
                    if (returnAll) {
                        const all = await apiAll(buildPath);
                        pushItems(all);
                    }
                    else {
                        const page = this.getNodeParameter("page", i);
                        const response = await api("GET", buildPath(page));
                        pushItems(response.data || []);
                    }
                };
                if (resource === "bots") {
                    const botType = () => this.getNodeParameter("botType", i);
                    const botId = () => this.getNodeParameter("botId", i);
                    if (operation === "list") {
                        const fields = this.getNodeParameter("fields", i);
                        const status = this.getNodeParameter("status", i);
                        await handleList((page) => `/api/v2/bots/${botType()}` +
                            (0, GenericFunctions_1.buildQuery)({ fields, page, status }));
                    }
                    else if (operation === "start") {
                        const response = await api("POST", `/api/v2/bots/${botType()}/${botId()}/start`);
                        returnData.push({ json: response });
                    }
                    else if (operation === "stop") {
                        const type = botType();
                        const query = {};
                        if (type === "grid") {
                            query.closeGridType = this.getNodeParameter("closeGridType", i);
                            if (this.getNodeParameter("cancelPartiallyFilled", i)) {
                                query.cancelPartiallyFilled = true;
                            }
                        }
                        else {
                            query.closeType = this.getNodeParameter("closeType", i);
                        }
                        const response = await api("POST", `/api/v2/bots/${type}/${botId()}/stop` + (0, GenericFunctions_1.buildQuery)(query));
                        returnData.push({ json: response });
                    }
                    else if (operation === "archive") {
                        const response = await api("DELETE", `/api/v2/bots/${botType()}/${botId()}`);
                        returnData.push({ json: response || { success: true } });
                    }
                    else if (operation === "restore") {
                        const response = await api("POST", `/api/v2/bots/${botType()}/${botId()}/restore`);
                        returnData.push({ json: response });
                    }
                    else if (operation === "clone") {
                        const name = this.getNodeParameter("cloneName", i);
                        const body = name ? { name } : {};
                        const response = await api("POST", `/api/v2/bots/${botType()}/${botId()}/clone`, body);
                        returnData.push({ json: response });
                    }
                    else if (operation === "update") {
                        const settings = this.getNodeParameter("settings", i);
                        const body = JSON.parse(settings);
                        const response = await api("PUT", `/api/v2/bots/${botType()}/${botId()}`, body);
                        returnData.push({ json: response });
                    }
                    else if (operation === "changePairs") {
                        const pairsToSet = this.getNodeParameter("pairsToSet", i)
                            .split(",")
                            .map((p) => p.trim())
                            .filter((p) => p.length > 0);
                        const pairsToSetMode = this.getNodeParameter("pairsToSetMode", i);
                        const response = await api("PUT", `/api/v2/bots/${botType()}/${botId()}/pairs`, { pairsToSet, pairsToSetMode });
                        returnData.push({ json: response });
                    }
                }
                else if (resource === "deals") {
                    const dealType = () => this.getNodeParameter("dealType", i);
                    if (operation === "list") {
                        const fields = this.getNodeParameter("fields", i);
                        const status = this.getNodeParameter("status", i);
                        const botId = this.getNodeParameter("botId", i);
                        await handleList((page) => `/api/v2/deals/${dealType()}` +
                            (0, GenericFunctions_1.buildQuery)({ fields, page, status, botId }));
                    }
                    else if (operation === "update") {
                        const dealId = this.getNodeParameter("dealId", i);
                        const settings = this.getNodeParameter("settings", i);
                        const body = JSON.parse(settings);
                        const response = await api("PUT", `/api/v2/deals/${dealType()}/${dealId}`, body);
                        returnData.push({ json: response });
                    }
                    else if (operation === "start") {
                        const botId = this.getNodeParameter("botId", i);
                        const symbol = this.getNodeParameter("symbol", i);
                        const body = symbol ? { symbol } : {};
                        const response = await api("POST", `/api/v2/deals/${dealType()}/${botId}/start`, body);
                        returnData.push({ json: response });
                    }
                    else if (operation === "close") {
                        const dealId = this.getNodeParameter("dealId", i);
                        const closeType = this.getNodeParameter("closeType", i);
                        const response = await api("DELETE", `/api/v2/deals/${dealType()}/${dealId}` +
                            (0, GenericFunctions_1.buildQuery)({ type: closeType }));
                        returnData.push({ json: response || { success: true } });
                    }
                    else if (operation === "manageFunds") {
                        const fundsOperation = this.getNodeParameter("fundsOperation", i);
                        const dealId = this.getNodeParameter("dealId", i);
                        const botId = this.getNodeParameter("botId", i);
                        const qty = this.getNodeParameter("qty", i);
                        const fundsType = this.getNodeParameter("fundsType", i);
                        const symbol = this.getNodeParameter("symbol", i);
                        const asset = fundsType === "fixed"
                            ? this.getNodeParameter("asset", i)
                            : "";
                        const body = { qty, type: fundsType };
                        if (asset) {
                            body.asset = asset;
                        }
                        if (symbol) {
                            body.symbol = symbol;
                        }
                        const response = await api("POST", `/api/v2/deals/dca/${fundsOperation}` +
                            (0, GenericFunctions_1.buildQuery)({ dealId, botId }), body);
                        returnData.push({ json: response });
                    }
                }
                else if (resource === "user") {
                    if (operation === "exchanges") {
                        const response = await api("GET", "/api/v2/user/exchanges");
                        pushItems(response.data || [response]);
                    }
                    else if (operation === "balances") {
                        const fields = this.getNodeParameter("fields", i);
                        const exchangeId = this.getNodeParameter("exchangeId", i);
                        const assets = this.getNodeParameter("assets", i);
                        await handleList((page) => "/api/v2/user/balances" +
                            (0, GenericFunctions_1.buildQuery)({ fields, page, exchangeId, assets }));
                    }
                }
                else if (resource === "general") {
                    if (operation === "screener") {
                        const page = this.getNodeParameter("screenerPage", i);
                        const pageSize = this.getNodeParameter("pageSize", i);
                        const fields = this.getNodeParameter("fields", i);
                        const sortField = this.getNodeParameter("sortField", i);
                        const sortType = this.getNodeParameter("sortType", i);
                        const filterModelRaw = this.getNodeParameter("filterModel", i).trim();
                        // Treat blank or an empty object as "no filter" so it isn't sent
                        const filterModel = filterModelRaw === "" || filterModelRaw === "{}"
                            ? ""
                            : filterModelRaw;
                        const response = await api("GET", "/api/v2/screener" +
                            (0, GenericFunctions_1.buildQuery)({
                                page,
                                pageSize,
                                fields,
                                sortField,
                                sortType,
                                filterModel,
                            }));
                        pushItems(response.data || [response]);
                    }
                    else if (operation === "supportedExchanges") {
                        const response = await api("GET", "/api/exchanges");
                        pushItems(response.data || [response]);
                    }
                    else if (operation === "customApiCall") {
                        const method = this.getNodeParameter("customMethod", i);
                        const url = this.getNodeParameter("customUrl", i);
                        let body;
                        if (method === "POST" || method === "PUT") {
                            const raw = this.getNodeParameter("customBody", i);
                            if (raw && raw.trim()) {
                                body = JSON.parse(raw);
                            }
                        }
                        const response = await api(method, url, body);
                        returnData.push({ json: response || { success: true } });
                    }
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    const message = error instanceof Error ? error.message : String(error);
                    returnData.push({ json: { error: message } });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.GainiumV2 = GainiumV2;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gainiumApiRequestAllItems = exports.gainiumApiRequest = exports.buildQuery = void 0;
const n8n_workflow_1 = require("n8n-workflow");
/**
 * Build a query string from a record, skipping null/undefined/empty values.
 * Returns "" or "?a=1&b=2".
 */
function buildQuery(params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined || value === "") {
            continue;
        }
        search.append(key, String(value));
    }
    const qs = search.toString();
    return qs ? `?${qs}` : "";
}
exports.buildQuery = buildQuery;
/**
 * Make a single signed request against the Gainium V2 API.
 * @param pathWithQuery e.g. "/api/v2/bots/dca?fields=standard&page=1"
 */
async function gainiumApiRequest(method, pathWithQuery, body, paperContext = false) {
    // Build the absolute URL from the credential's base URL. We only read base_url here;
    // authentication (Token/Time/Signature HMAC headers) is applied by the credential's
    // `authenticate` function via httpRequestWithAuthentication below — this function never
    // signs requests itself.
    const credentials = await this.getCredentials("gainiumApi");
    const baseUrl = (credentials.base_url || "https://api.gainium.io").replace(/\/+$/, "");
    const options = {
        url: `${baseUrl}${pathWithQuery}`,
        method,
        headers: {
            "Content-Type": "application/json",
            // V2 selects the paper vs live account from this header (not the signature)
            "paper-context": paperContext ? "true" : "false",
        },
        json: true,
    };
    if (body) {
        options.body = body;
    }
    let response;
    try {
        response = (await this.helpers.httpRequestWithAuthentication.call(this, "gainiumApi", options));
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
    }
    if (response &&
        (response.status === "NOTOK" || response.status === "error")) {
        const reason = response.reason;
        const message = (reason && typeof reason === "object" && reason.message) ||
            (typeof reason === "string" ? reason : "") ||
            "Gainium API request failed";
        throw new n8n_workflow_1.NodeApiError(this.getNode(), response, { message });
    }
    return response;
}
exports.gainiumApiRequest = gainiumApiRequest;
/**
 * Fetch every page of a V2 list endpoint. V2 list responses are shaped
 * `{ data: [...], meta: { page, total } }` and pages are 1-indexed.
 * @param buildPath function that returns the full path+query for a given page
 */
async function gainiumApiRequestAllItems(buildPath, paperContext = false) {
    const items = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
        const response = await gainiumApiRequest.call(this, "GET", buildPath(page), undefined, paperContext);
        const data = response.data || [];
        items.push(...data);
        const meta = response.meta;
        const currentPage = meta ? Number(meta.page) : page;
        const totalPages = meta ? Number(meta.total) : page;
        if (meta && currentPage < totalPages) {
            page = currentPage + 1;
        }
        else {
            hasMore = false;
        }
    }
    return items;
}
exports.gainiumApiRequestAllItems = gainiumApiRequestAllItems;

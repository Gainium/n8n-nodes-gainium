"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gainiumApiRequestAllItems = exports.gainiumApiRequest = exports.buildQuery = void 0;
/**
 * HMAC SHA256 using the Web Crypto API (works in Node.js and browsers without
 * pulling in the `crypto` module — matches the V1 implementation).
 */
async function createHmacSha256(secret, message) {
    const encoder = new TextEncoder();
    const cryptoKey = await globalThis.crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await globalThis.crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
    const bytes = new Uint8Array(signature);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
/**
 * Gainium signs requests as HMAC-SHA256 of `body + METHOD + path(+query) + timestamp`.
 * Identical scheme to the V1 node and the Make.com app.
 */
async function getSignature(secret, body, method, pathWithQuery, timestamp) {
    return createHmacSha256(secret, body + method + pathWithQuery + timestamp);
}
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
    const credentials = await this.getCredentials("gainiumApi");
    const baseUrl = credentials.base_url || "https://api.gainium.io";
    const token = credentials.token;
    const secret = credentials.secret;
    const timestamp = Date.now();
    const bodyString = body ? JSON.stringify(body) : "";
    const signature = await getSignature(secret, bodyString, method, pathWithQuery, timestamp);
    const options = {
        url: `${baseUrl}${pathWithQuery}`,
        method,
        headers: {
            "Content-Type": "application/json",
            Token: token,
            Time: timestamp,
            Signature: signature,
            // V2 selects the paper vs live account from this header (not the signature)
            "paper-context": paperContext ? "true" : "false",
        },
        json: true,
    };
    if (body) {
        options.body = body;
    }
    const response = (await this.helpers.httpRequest(options));
    if (response &&
        (response.status === "NOTOK" || response.status === "error")) {
        const reason = response.reason;
        const message = (reason && typeof reason === "object" && reason.message) ||
            (typeof reason === "string" ? reason : "") ||
            "Gainium API request failed";
        throw new Error(message);
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

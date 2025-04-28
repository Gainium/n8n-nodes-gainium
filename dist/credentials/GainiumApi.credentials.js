"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GainiumApi = void 0;
class GainiumApi {
    constructor() {
        this.name = "gainiumApi";
        this.displayName = "Gainium API";
        this.properties = [
            {
                displayName: "Base URL",
                name: "base_url",
                type: "string",
                default: "https://api.gainium.io",
                description: "Base URL for Gainium API. You can get it from https://app.gainium.io/",
            },
            {
                displayName: "Token",
                name: "token",
                type: "string",
                default: "",
                description: "You can get token and secret for Gainium API from https://app.gainium.io/",
            },
            {
                displayName: "Secret",
                name: "secret",
                type: "string",
                default: "",
                description: "You can get token and secret for Gainium API from https://app.gainium.io/",
            },
        ];
    }
}
exports.GainiumApi = GainiumApi;

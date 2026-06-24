"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gainium = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GainiumV1_node_1 = require("./v1/GainiumV1.node");
const GainiumV2_node_1 = require("./v2/GainiumV2.node");
class Gainium extends n8n_workflow_1.VersionedNodeType {
    constructor() {
        const baseDescription = {
            displayName: "Gainium",
            name: "Gainium",
            icon: "file:gainium.svg",
            group: ["transform"],
            description: "Operates with the official Gainium API",
            defaultVersion: 2,
        };
        const nodeVersions = {
            1: new GainiumV1_node_1.GainiumV1(baseDescription),
            2: new GainiumV2_node_1.GainiumV2(baseDescription),
        };
        super(nodeVersions, baseDescription);
    }
}
exports.Gainium = Gainium;

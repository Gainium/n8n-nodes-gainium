import {
  INodeTypeBaseDescription,
  IVersionedNodeType,
  VersionedNodeType,
} from "n8n-workflow"

import { GainiumV1 } from "./v1/GainiumV1.node"
import { GainiumV2 } from "./v2/GainiumV2.node"

export class Gainium extends VersionedNodeType {
  constructor() {
    const baseDescription: INodeTypeBaseDescription = {
      displayName: "Gainium",
      name: "Gainium",
      icon: "file:gainium.svg",
      group: ["transform"],
      description: "Operates with the official Gainium API",
      defaultVersion: 2,
    }

    const nodeVersions: IVersionedNodeType["nodeVersions"] = {
      1: new GainiumV1(baseDescription),
      2: new GainiumV2(baseDescription),
    }

    super(nodeVersions, baseDescription)
  }
}

/** @format */

import { MapOfType } from "@aitianyu.cn/types";
import { IFeaturesConfig } from "../Constant";
import { IFeatureManager } from "./interfaces";

export class FeatureManagerImpl implements IFeatureManager {
    allFeatures(start?: number, count?: number): MapOfType<IFeaturesConfig> {
        throw new Error("Method not implemented.");
    }
    isActive(name: string): boolean {
        throw new Error("Method not implemented.");
    }
    contains(name: string): boolean {
        throw new Error("Method not implemented.");
    }
    enable(name: string, impactDepFeatures?: boolean): boolean {
        throw new Error("Method not implemented.");
    }
    disable(name: string, impactDepFeatures?: boolean): boolean {
        throw new Error("Method not implemented.");
    }
    addFeature(name: string, config: IFeaturesConfig): boolean {
        throw new Error("Method not implemented.");
    }
    removeFeature(name: string): boolean {
        throw new Error("Method not implemented.");
    }
}

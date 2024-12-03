/** @format */

import { MapOfType } from "@aitianyu.cn/types";
import { IFeatureManager, IFeaturesConfig } from "../interface/FeatureMgr";

export class FeatureManagerImpl implements IFeatureManager {
    allFeatures(sessionId: string, start?: number, count?: number): MapOfType<IFeaturesConfig> {
        throw new Error("Method not implemented.");
    }
    isActive(sessionId: string, name: string): boolean {
        throw new Error("Method not implemented.");
    }
    contains(sessionId: string, name: string): boolean {
        throw new Error("Method not implemented.");
    }
    enable(sessionId: string, name: string, impactDepFeatures?: boolean): boolean {
        throw new Error("Method not implemented.");
    }
    disable(sessionId: string, name: string, impactDepFeatures?: boolean): boolean {
        throw new Error("Method not implemented.");
    }
    addFeature(sessionId: string, name: string, config: IFeaturesConfig): boolean {
        throw new Error("Method not implemented.");
    }
    removeFeature(sessionId: string, name: string): boolean {
        throw new Error("Method not implemented.");
    }
}

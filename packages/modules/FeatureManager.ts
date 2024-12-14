/** @format */

import {
    handleFeatureGetCount,
    handleFeatureGetFeatures,
    handleFeatureIsActive,
    handleFeatureSearchFeatures,
    handleFeatureStateChange,
} from "#core/infra/code/FeatureCodes";
import { MapOfBoolean, MapOfType } from "@aitianyu.cn/types";
import { IFeaturesConfig } from "#interface";

export class FeatureManager {
    public static async isActive(feature: string): Promise<boolean> {
        return await handleFeatureIsActive(feature);
    }

    public static async count(): Promise<number> {
        return await handleFeatureGetCount();
    }

    public static async allFeatures(start: number = 0, count: number = 50): Promise<MapOfType<IFeaturesConfig>> {
        return await handleFeatureGetFeatures(start, count);
    }

    public static async enable(...features: string[]): Promise<void> {
        const changes: MapOfBoolean = {};
        for (const feature of features) {
            changes[feature] = true;
        }

        await handleFeatureStateChange(changes);
    }

    public static async disable(...features: string[]): Promise<void> {
        const changes: MapOfBoolean = {};
        for (const feature of features) {
            changes[feature] = false;
        }

        await handleFeatureStateChange(changes);
    }

    public static async search(search: string, start: number = 0): Promise<MapOfType<IFeaturesConfig>> {
        return await handleFeatureSearchFeatures(search, start);
    }
}

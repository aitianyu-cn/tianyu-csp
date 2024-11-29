/** @format */

import { MapOfType } from "@aitianyu.cn/types";
import { IFeaturesConfig } from "../Constant";

export interface IFeatureManager extends IFeatureManagerReader, IFeatureManagerAdmin {}

export interface IFeatureManagerReader {
    allFeatures(): MapOfType<IFeaturesConfig>;
    isActive(name: string): boolean;
    contains(name: string): boolean;
}

export interface IFeatureManagerAdmin {
    enable(name: string, impactDepFeatures?: boolean): boolean;
    disable(name: string, impactDepFeatures?: boolean): boolean;
    addFeature(name: string, config: IFeaturesConfig): boolean;
    removeFeature(name: string): boolean;
}

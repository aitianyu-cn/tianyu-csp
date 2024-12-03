/** @format */

import { MapOfType } from "@aitianyu.cn/types";

/** CSP feature config for each one feature */
export interface IFeaturesConfig {
    /** indicates the feature is default enabled if it is true */
    enable: boolean;
    /** description of the feature */
    description: string;
    /** contains the dependent feature names, indicates current feature can be enabled
     *  only when all the dependent features all enabled
     */
    dependency: string[];
}

export interface IFeatureManager extends IFeatureManagerReader, IFeatureManagerAdmin {}

export interface IFeatureManagerReader {
    allFeatures(sessionId: string, start?: number, count?: number): MapOfType<IFeaturesConfig>;
    isActive(sessionId: string, name: string): boolean;
    contains(sessionId: string, name: string): boolean;
}

export interface IFeatureManagerAdmin {
    enable(sessionId: string, name: string, impactDepFeatures?: boolean): boolean;
    disable(sessionId: string, name: string, impactDepFeatures?: boolean): boolean;
    addFeature(sessionId: string, name: string, config: IFeaturesConfig): boolean;
    removeFeature(sessionId: string, name: string): boolean;
}

/** @format */

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
    allFeatures(start?: number, count?: number): Promise<(IFeaturesConfig & { id: string })[]>;
    isActive(name: string): Promise<boolean>;
    contains(name: string): Promise<boolean>;
}

export interface IFeatureManagerAdmin {
    enable(name: string): Promise<void>;
    disable(name: string): Promise<void>;
}

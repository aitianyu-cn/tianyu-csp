/** @format */

export interface IFeature {
    isActive(featureName: string): Promise<boolean>;
}

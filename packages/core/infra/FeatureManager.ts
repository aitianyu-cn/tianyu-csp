/** @format */

import { IFeature } from "packages/interface/api/feature";
import { handleFeatureIsActive } from "./code/FeatureCodes";

export class FeatureManager implements IFeature {
    public async isActive(featureName: string): Promise<boolean> {
        return handleFeatureIsActive(featureName);
    }
}

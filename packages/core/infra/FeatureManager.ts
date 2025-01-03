/** @format */

import { IFeature } from "packages/interface/api/feature";
import { handleFeatureIsActive } from "./code/FeatureCodes";

/** CSP Feature Manager for global definition */
export class FeatureManager implements IFeature {
    public async isActive(featureName: string): Promise<boolean> {
        return handleFeatureIsActive(featureName);
    }
}

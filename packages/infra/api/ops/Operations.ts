/** @format */

import { FeatureManagerImpl } from "./FeatureManagerImpl";
import { IFeatureManager } from "./interfaces";

export class Operations {
    private static _featureManager: FeatureManagerImpl = new FeatureManagerImpl();

    public static get FeatureManager(): IFeatureManager {
        return Operations._featureManager;
    }
}

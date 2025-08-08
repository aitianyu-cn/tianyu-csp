/** @format */

import * as FEATURE_CODES from "#core/infra/code/FeatureCodes";
import { FeatureManager } from "#core/infra/FeatureManager";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.FeatureManager", () => {
    const mgr = new FeatureManager();

    it("isActive", () => {
        jest.spyOn(FEATURE_CODES, "handleFeatureIsActive").mockImplementation(async () => Promise.resolve(true));
        expect(mgr.isActive("TEST_FEATURE")).toBeTruthy();
        expect(FEATURE_CODES.handleFeatureIsActive).toHaveBeenCalledWith("TEST_FEATURE");
    });
});

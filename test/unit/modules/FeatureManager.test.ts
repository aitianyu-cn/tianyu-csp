/** @format */

import * as FEATURE_HANDLER from "#core/infra/code/FeatureCodes";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.FeatureManager", () => {
    it("isActive", async () => {
        jest.spyOn(FEATURE_HANDLER, "handleFeatureIsActive").mockReturnValue(Promise.resolve(true));
        const isActive = await TIANYU.import.MODULE.FeatureManager.isActive("TEST");
        expect(isActive).toBeTruthy();
    });
});

/** @format */

import * as FEATURE_HANDLER from "#core/infra/code/FeatureCodes";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.FeatureManager", () => {
    it("isActive", async () => {
        jest.spyOn(FEATURE_HANDLER, "handleFeatureIsActive").mockReturnValue(Promise.resolve(true));
        const isActive = await TIANYU.import.MODULE.FeatureManager.isActive("TEST");
        expect(isActive).toBeTruthy();
    });

    it("count", async () => {
        jest.spyOn(FEATURE_HANDLER, "handleFeatureGetCount").mockReturnValue(Promise.resolve(20));
        const count = await TIANYU.import.MODULE.FeatureManager.count();
        expect(count).toEqual(20);
    });

    it("allFeatures", async () => {
        const features = {
            F1: { enable: true, description: "", dependency: [] },
            F2: { enable: true, description: "", dependency: ["F1"] },
            F3: { enable: true, description: "", dependency: ["F2", "F1"] },
        };
        jest.spyOn(FEATURE_HANDLER, "handleFeatureGetFeatures").mockReturnValue(Promise.resolve(features));
        const featureMap = await TIANYU.import.MODULE.FeatureManager.allFeatures();
        expect(featureMap).toEqual(features);
    });

    it("enable", async () => {
        jest.spyOn(FEATURE_HANDLER, "handleFeatureStateChange").mockReturnValue(Promise.resolve());
        await TIANYU.import.MODULE.FeatureManager.enable("F1", "F2");
        expect(FEATURE_HANDLER.handleFeatureStateChange).toHaveBeenCalled();
    });

    it("disable", async () => {
        jest.spyOn(FEATURE_HANDLER, "handleFeatureStateChange").mockReturnValue(Promise.resolve());
        await TIANYU.import.MODULE.FeatureManager.disable("F1", "F2");
        expect(FEATURE_HANDLER.handleFeatureStateChange).toHaveBeenCalled();
    });

    it("search", async () => {
        const features = {
            F1: { enable: true, description: "", dependency: [] },
            F2: { enable: true, description: "", dependency: ["F1"] },
            F3: { enable: true, description: "", dependency: ["F2", "F1"] },
        };
        jest.spyOn(FEATURE_HANDLER, "handleFeatureSearchFeatures").mockReturnValue(Promise.resolve(features));
        const featureMap = await TIANYU.import.MODULE.FeatureManager.search("F");
        expect(featureMap).toEqual(features);
    });
});

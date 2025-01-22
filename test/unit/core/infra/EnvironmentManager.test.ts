/** @format */

import { EnvironmentManager } from "#core/infra/EnvironmentManager";
import { PROJECT_ENVIRONMENT_MODE, PROJECT_NAME, PROJECT_ROOT_PATH, PROJECT_VERSION } from "packages/Common";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.EnvironmentManager", () => {
    it("test", () => {
        const mgr = new EnvironmentManager();

        expect(mgr.baseUrl).toEqual(PROJECT_ROOT_PATH);
        expect(mgr.version).toEqual(PROJECT_VERSION);
        expect(mgr.development).toEqual(PROJECT_ENVIRONMENT_MODE.toLowerCase() === "development");
        expect(mgr.name).toEqual(PROJECT_NAME);
    });
});

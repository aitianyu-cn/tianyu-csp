/** @format */

import { IDBConnection } from "#interface";
import * as XCALL from "#core/infra/code/GenericXcall";
import { handleFeatureIsActive } from "#core/infra/code/FeatureCodes";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.code.FeatureCodes", () => {
    let XCALL_SPYON: any;

    beforeEach(() => {
        XCALL_SPYON = jest.spyOn(XCALL, "doXcall");
    });

    describe("handleFeatureIsActive", () => {
        it("query failed", async () => {
            XCALL_SPYON.mockReturnValue(Promise.resolve("false"));

            const active = await handleFeatureIsActive("");

            expect(active).toBeFalsy();
        });

        it("success", async () => {
            XCALL_SPYON.mockReturnValue(Promise.resolve(true));

            const active = await handleFeatureIsActive("");

            expect(active).toBeTruthy();
        });
    });
});

/** @format */

import { RequestRestData } from "#interface";
import { RestHelper } from "#utils/RestHelper";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.RestHelper", () => {
    describe("getRest", () => {
        it("no valid path", () => {
            expect(RestHelper.getRest("")).toBeNull();
            expect(RestHelper.getRest("/")).toBeNull();
            expect(RestHelper.getRest("/no_test")).toBeNull();
        });

        it("valid path", () => {
            const rest: RequestRestData = { package: "a", module: "b", method: "c" };

            expect(RestHelper.getRest("/test/valid")).toEqual(rest);
            expect(RestHelper.getRest("/test/invalid")).toBeNull();
            expect(RestHelper.getRest("test/no_prefix")).toEqual(rest);
        });
    });
});

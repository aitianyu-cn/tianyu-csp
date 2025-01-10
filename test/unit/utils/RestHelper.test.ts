/** @format */

import { HttpRestItem } from "#interface";
import { RestHelper } from "#utils";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.RestHelper", () => {
    describe("getRest", () => {
        it("no valid path", () => {
            expect(RestHelper.getRest("")).toBeNull();
            // expect(RestHelper.getRest("/")).toBeNull();
            expect(RestHelper.getRest("/no_test")).toBeNull();
        });

        it("valid path", () => {
            const rest: HttpRestItem = { package: "a", module: "b", method: "c" };

            expect(RestHelper.getRest("/test/valid")).toEqual(rest);
            expect(RestHelper.getRest("/test/invalid")).toBeNull();
            expect(RestHelper.getRest("test/no_prefix")).toEqual(rest);
        });

        it("default case", () => {
            const rest: HttpRestItem = { package: "a", module: "b", method: "default" };

            expect(RestHelper.getRest("/empty")).toEqual(rest);
        });
    });

    describe("getRest customized", () => {
        it("no valid path", () => {
            expect(RestHelper.getRest("", { "/": {} })).toBeNull();
            // expect(RestHelper.getRest("/")).toBeNull();
            expect(
                RestHelper.getRest(
                    "/no_test",
                    { "/": {} },
                    {
                        package: "p",
                        module: "m",
                        method: "m",
                    },
                ),
            ).toEqual({ package: "p", module: "m", method: "m" });
        });
    });
});

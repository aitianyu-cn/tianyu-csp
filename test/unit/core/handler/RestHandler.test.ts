/** @format */

import { RestHandler } from "#core/handler/RestHandler";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.handler.RestHandler", () => {
    it("normal cases", () => {
        const rest = TIANYU.import("test", "rest-test");
        const handler = new RestHandler(rest);
        const urls = [
            "/",
            "/package",
            "/package/test-module",
            "/package/test-module/test-function",
            "/package/test-module-2/test-function-2/test-generic-map",
            "/config/admin",
            "/config/system/user-data",
            "/config",
            "/double/data",
            "/format-test/data",
        ];
        const targets = [
            { package: "$", module: "default-loader", method: "html" },
            { package: "package", module: "test-module", method: "default" },
            { package: "package", module: "generic", method: "default" },
            { package: "package", module: "test-module", method: "test-function" },
            { package: "package-generic", module: "test-module-2", method: "test-function-2" },
            { package: "package", module: "admin", method: "default" },
            { package: "package", module: "system", method: "default" },
            null,
            { package: "double-package.data", module: "data", method: "default" },
            { package: "format-test", module: "data", method: "default" },
        ];

        for (let i = 0; i < urls.length; ++i) {
            expect(handler.mapping(urls[i])).toEqual(targets[i]);
        }
    });

    it("no rest provides", () => {
        const handler = new RestHandler(undefined, true);
        expect(handler.mapping("/")).toEqual({ package: "$.default", module: "rest-fallback", method: "default" });
    });

    it("empty data test", () => {
        const rest = { "/test": {} };
        const handler = new RestHandler(rest);
        expect(handler.mapping("/test")).toEqual({ package: "", module: "", method: "default" });
    });
});

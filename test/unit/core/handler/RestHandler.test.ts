/** @format */

import { RestHandler } from "#core/handler/RestHandler";
import { HttpCallMethod, PathEntry, RestMappingResult } from "#interface";

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
        const targets: Record<HttpCallMethod, PathEntry | null>[] = [
            {
                GET: { package: "$", module: "default-loader", method: "html" },
                POST: { package: "$", module: "default-loader", method: "html" },
            },
            {
                GET: { package: "package", module: "test-module", method: "default" },
                POST: null,
            },
            {
                GET: null,
                POST: { package: "package", module: "generic", method: "default" },
            },
            {
                GET: { package: "package", module: "test-module", method: "test-function-get" },
                POST: { package: "package", module: "test-module", method: "test-function-post" },
            },
            {
                GET: { package: "package-generic-get", module: "test-module-2", method: "test-function-2" },
                POST: { package: "package-generic", module: "test-module-2", method: "test-function-2" },
            },
            {
                GET: { package: "package", module: "admin", method: "default" },
                POST: { package: "package", module: "admin", method: "default" },
            },
            {
                GET: { package: "package", module: "system", method: "default" },
                POST: { package: "package", module: "system", method: "default" },
            },
            {
                GET: null,
                POST: null,
            },
            {
                GET: { package: "double-package.data", module: "data", method: "default" },
                POST: { package: "double-package.data", module: "data", method: "default" },
            },
            {
                GET: { package: "format-test", module: "data", method: "default" },
                POST: { package: "format-test", module: "data", method: "default" },
            },
            {
                GET: { package: "", module: "", method: "default" },
                POST: { package: "", module: "", method: "default" },
            },
        ];

        for (let i = 0; i < urls.length; ++i) {
            const getter = handler.mapping(urls[i], "GET");
            const poster = handler.mapping(urls[i], "POST");
            expect(getter).toEqual(targets[i].GET ? { handler: targets[i].GET } : targets[i].GET);
            expect(poster).toEqual(targets[i].POST ? { handler: targets[i].POST } : targets[i].POST);
        }
    });

    it("no rest provides", () => {
        const handler = new RestHandler(undefined, true);
        expect(handler.mapping("/", "GET")).toEqual({
            handler: { package: "$.default", module: "rest-fallback", method: "default" },
        });
        expect(handler.mapping("/", "POST")).toEqual({
            handler: { package: "$.default", module: "rest-fallback", method: "default" },
        });
    });

    it("empty data test", () => {
        const rest = { "/test": {} };
        const handler = new RestHandler(rest);
        expect(handler.mapping("/test", "GET")?.handler).toEqual({ package: "", module: "", method: "default" });
        expect(handler.mapping("/test", "POST")?.handler).toEqual({ package: "", module: "", method: "default" });
    });

    it("proxy", () => {
        const rest = TIANYU.import("test", "rest-test");
        const handler = new RestHandler(rest);
        const urls = ["/default/handle/proxy/test", "/default/handle/proxy", "/default/handle/proxy1"];
        const targets: Record<HttpCallMethod, RestMappingResult>[] = [
            {
                GET: { handler: { package: "", module: "", method: "default" }, proxy: { host: "resources.aitianyu.cn" } },
                POST: { handler: { package: "", module: "", method: "default" }, proxy: { host: "resources.aitianyu.cn" } },
            },
            {
                GET: { handler: { package: "", module: "", method: "default" }, proxy: { host: "resources.aitianyu.cn" } },
                POST: { handler: { package: "", module: "", method: "default" }, proxy: { host: "resources.aitianyu.cn" } },
            },
            {
                GET: { handler: { package: "", module: "", method: "default" }, proxy: { host: "aitianyu.cn" } },
                POST: { handler: { package: "", module: "", method: "default" }, proxy: { host: "aitianyu.cn" } },
            },
        ];

        for (let i = 0; i < urls.length; ++i) {
            const getter = handler.mapping(urls[i], "GET");
            const poster = handler.mapping(urls[i], "POST");
            expect(getter).toEqual(targets[i].GET);
            expect(poster).toEqual(targets[i].POST);
        }
    });
});

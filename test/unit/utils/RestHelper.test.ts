/** @format */

import { HttpRequestProxyOption, HttpRestItem, RequestPayloadData } from "#interface";
import { RestHelper } from "#utils";
import { AreaCode } from "@aitianyu.cn/types";

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

    it("toPathEntry", () => {
        expect(RestHelper.toPathEntry({})).toEqual({ package: "", module: "", method: "" });
        expect(RestHelper.toPathEntry({ package: "test" })).toEqual({ package: "test", module: "", method: "" });
        expect(RestHelper.toPathEntry({ package: "test", module: "develop" })).toEqual({
            package: "test",
            module: "develop",
            method: "",
        });
        expect(RestHelper.toPathEntry({ package: "test", module: "develop", method: "run" })).toEqual({
            package: "test",
            module: "develop",
            method: "run",
        });
        expect(RestHelper.toPathEntry({ proxy: { host: "" } })).toEqual({
            package: "$",
            module: "default-loader",
            method: "proxy",
        });
        expect(RestHelper.toPathEntry({ proxy: { host: "" }, package: "test" })).toEqual({
            package: "$",
            module: "default-loader",
            method: "proxy",
        });
        expect(RestHelper.toPathEntry({ proxy: { host: "" }, package: "test", module: "tm" })).toEqual({
            package: "$",
            module: "default-loader",
            method: "proxy",
        });
        expect(RestHelper.toPathEntry({ proxy: { host: "" }, package: "test", module: "tm", method: "proxy" })).toEqual({
            package: "test",
            module: "tm",
            method: "proxy",
        });
    });

    describe("transmit", () => {
        it("no trans given", () => {
            const payload: RequestPayloadData = {
                host: "localhost",
                url: "/test",
                version: "http",
                serviceId: "",
                requestId: "",
                sessionId: "",
                disableCache: false,
                type: "http",
                language: AreaCode.unknown,
                body: undefined,
                cookie: {},
                param: {},
                headers: {},
            };

            RestHelper.transmit(payload);

            expect(payload.host).toEqual("localhost");
            expect(payload.url).toEqual("/test");
        });

        it("rewrite", () => {
            const trans: HttpRequestProxyOption = {
                host: "server.com",
                rewrite: {
                    "/remote": "",
                    "/remote/test/code": "/test-code",
                    "/remote/debug": "",
                },
            };
            const payloadGeneration = (url: string): RequestPayloadData => ({
                host: "localhost",
                url: url,
                version: "http",
                serviceId: "",
                requestId: "",
                sessionId: "",
                disableCache: false,
                type: "http",
                language: AreaCode.unknown,
                body: undefined,
                cookie: {},
                param: {},
                headers: {},
            });

            const fnTest = (url: string, target: string) => {
                const payload = payloadGeneration(url);
                RestHelper.transmit(payload, trans);
                expect(payload.host).toEqual("server.com");
                expect(payload.url).toEqual(target);
            };

            fnTest("/remote/test/code", "/test-code");
            fnTest("/remote/release/code", "/release/code");
            fnTest("/remote/debug/code", "/code");
        });
    });
});

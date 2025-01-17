/** @format */

import { HttpRequestProxyOption, HttpRestItem, RequestPayloadData } from "#interface";
import { RestHelper } from "#utils";
import { AreaCode } from "@aitianyu.cn/types";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.RestHelper", () => {
    describe("getRest", () => {
        it("no valid path", () => {
            expect(RestHelper.getRest("", "GET")).toBeNull();
            expect(RestHelper.getRest("", "POST")).toBeNull();
            // expect(RestHelper.getRest("/")).toBeNull();
            expect(RestHelper.getRest("/no_test", "GET")).toBeNull();
            expect(RestHelper.getRest("/no_test", "POST")).toBeNull();
        });

        it("valid path", () => {
            const rest: HttpRestItem = { handler: { package: "a", module: "b", method: "c" } };

            expect(RestHelper.getRest("/test/valid", "GET")).toEqual(rest);
            expect(RestHelper.getRest("/test/valid", "POST")).toEqual(rest);
            expect(RestHelper.getRest("/test/invalid", "GET")).toBeNull();
            expect(RestHelper.getRest("/test/invalid", "POST")).toBeNull();
            expect(RestHelper.getRest("test/no_prefix", "GET")).toEqual(rest);
            expect(RestHelper.getRest("test/no_prefix", "POST")).toEqual(rest);
        });

        it("default case", () => {
            const rest: HttpRestItem = { handler: { package: "a", module: "b", method: "default" } };

            expect(RestHelper.getRest("/empty", "GET")).toEqual(rest);
            expect(RestHelper.getRest("/empty", "POST")).toEqual(rest);
        });
    });

    describe("getRest customized", () => {
        it("no valid path", () => {
            expect(RestHelper.getRest("", "GET", { "/": {} })).toBeNull();
            expect(RestHelper.getRest("", "POST", { "/": {} })).toBeNull();
            // expect(RestHelper.getRest("/")).toBeNull();
            expect(
                RestHelper.getRest(
                    "/no_test",
                    "GET",
                    { "/": {} },
                    {
                        package: "p",
                        module: "m",
                        method: "m",
                    },
                ),
            ).toEqual({ handler: { package: "p", module: "m", method: "m" } });
        });
    });

    it("toPathEntry", () => {
        expect(RestHelper.toPathEntry({ handler: {} })).toEqual({ package: "", module: "", method: "" });
        expect(RestHelper.toPathEntry({ handler: { package: "test" } })).toEqual({ package: "test", module: "", method: "" });
        expect(RestHelper.toPathEntry({ handler: { package: "test", module: "develop" } })).toEqual({
            package: "test",
            module: "develop",
            method: "",
        });
        expect(RestHelper.toPathEntry({ handler: { package: "test", module: "develop", method: "run" } })).toEqual({
            package: "test",
            module: "develop",
            method: "run",
        });
        expect(RestHelper.toPathEntry({ handler: {}, proxy: { host: "" } })).toEqual({
            package: "$",
            module: "default-loader",
            method: "proxy",
        });
        expect(RestHelper.toPathEntry({ proxy: { host: "" }, handler: { package: "test" } })).toEqual({
            package: "$",
            module: "default-loader",
            method: "proxy",
        });
        expect(RestHelper.toPathEntry({ proxy: { host: "" }, handler: { package: "test", module: "tm" } })).toEqual({
            package: "$",
            module: "default-loader",
            method: "proxy",
        });
        expect(
            RestHelper.toPathEntry({ proxy: { host: "" }, handler: { package: "test", module: "tm", method: "proxy" } }),
        ).toEqual({
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
                method: "GET",
                protocol: "http",
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
                method: "GET",
                protocol: "http",
                serviceId: "",
                requestId: "",
                sessionId: "",
                disableCache: false,
                type: "http",
                language: AreaCode.unknown,
                body: undefined,
                cookie: {},
                param: {},
                headers: { host: "test.com" },
            });

            const fnTest = (url: string, target: string) => {
                const payload = payloadGeneration(url);
                RestHelper.transmit(payload, trans);
                expect(payload.host).toEqual("server.com");
                expect(payload.url).toEqual(target);
                expect(payload.headers["host"]).toEqual("server.com");
            };

            fnTest("/remote/test/code", "/test-code");
            fnTest("/remote/release/code", "/release/code");
            fnTest("/remote/debug/code", "/code");
        });
    });
});

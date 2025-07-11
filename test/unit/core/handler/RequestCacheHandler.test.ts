/** @format */

import { RequestCacheDocument, RequestCacheHandler } from "#core/handler/RequestCacheHandler";
import { HTTP_STATUS_CODE, HttpRequestCacheOption, NetworkServiceResponseData, RequestPayloadData } from "#interface";
import { AreaCode } from "@aitianyu.cn/types";

function generatePayload(host?: string, url?: string, disableCache?: boolean): RequestPayloadData {
    return {
        host: host || "",
        url: url || "",
        method: "GET",
        protocol: "http",
        serviceId: "",
        requestId: "",
        sessionId: "",
        disableCache: !!disableCache,
        type: "http",
        language: AreaCode.unknown,
        body: undefined,
        cookie: {},
        param: {},
        headers: {},
    };
}

function generateResponse(status?: number, body?: any): NetworkServiceResponseData {
    return {
        statusCode: status || HTTP_STATUS_CODE.OK,
        headers: {},
        body: body,
    };
}

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.handler.RequestCacheHandler", () => {
    const DB_OPT = {
        cycle: jest.fn<void, [void]>(),
        clean: jest.fn<void, [void]>(),
        writer: jest.fn<void, [NetworkServiceResponseData, RequestPayloadData, HttpRequestCacheOption | undefined]>(),
        reader: jest.fn<Promise<NetworkServiceResponseData | null>, [RequestPayloadData, HttpRequestCacheOption | undefined]>(),
    };

    describe("local cache", () => {
        const CACHE = new RequestCacheHandler({ type: "local" });

        beforeEach(() => {
            CACHE.destroy();
        });

        describe("writeCache", () => {
            it("no option provided", () => {
                jest.spyOn(CACHE as any, "formatKey");
                CACHE.writeCache(generatePayload(), generateResponse());
                expect(CACHE["formatKey"]).not.toHaveBeenCalled();
            });

            it("not cache", () => {
                jest.spyOn(CACHE as any, "formatKey");
                const payload = generatePayload("", "", true);
                CACHE.writeCache(payload, generateResponse(), {
                    type: "url",
                });
                expect(CACHE["formatKey"]).not.toHaveBeenCalled();
            });

            it("url cache", () => {
                const payload = generatePayload("", "/test/code");
                payload.sessionId = "test_session";
                const response = generateResponse(HTTP_STATUS_CODE.OK, "test-body");
                CACHE.writeCache(payload, response, {
                    type: "url",
                    session: true,
                });

                const caches = CACHE["_cache"].get("test_session-test.code");
                expect(Array.isArray(caches) && caches.length === 1).toBeTruthy();
                expect(caches?.[0].response.body).toEqual("test-body");
            });

            it("custom cache", () => {
                const payload = generatePayload("", "/test/code");
                payload.sessionId = "test_session";
                payload.headers = { h1: "header-1", h2: "header-2", h3: "header-3" };
                payload.cookie = { c1: "cookie-1", c2: "cookie-2", c3: "cookie-3" };
                payload.param = { p1: ["param-1"], p2: ["param-2"], p3: ["param-3"] };
                const response = generateResponse(HTTP_STATUS_CODE.OK, "test-body");
                CACHE.writeCache(payload, response, {
                    type: "custom",
                    session: true,
                    header: ["h1", "h2"],
                    params: ["p1", "p2"],
                    cookie: ["c1", "c2"],
                });

                const caches = CACHE["_cache"].get("test_session-test.code");
                expect(Array.isArray(caches) && caches.length === 1).toBeTruthy();
                expect(caches?.[0].response.body).toEqual("test-body");
                expect(caches?.[0].cookie).toEqual({ c1: "cookie-1", c2: "cookie-2" });
                expect(caches?.[0].header).toEqual({ h1: "header-1", h2: "header-2" });
                expect(caches?.[0].param).toEqual({ p1: ["param-1"], p2: ["param-2"] });
            });

            it("full cache", () => {
                const payload = generatePayload("", "/test/code");
                payload.sessionId = "test_session";
                payload.headers = { h1: "header-1", h2: "header-2", h3: "header-3" };
                payload.cookie = { c1: "cookie-1", c2: "cookie-2", c3: "cookie-3" };
                payload.param = { p1: ["param-1"], p2: ["param-2"], p3: ["param-3"] };
                const response = generateResponse(HTTP_STATUS_CODE.OK, "test-body");
                CACHE.writeCache(payload, response, {
                    type: "full",
                    session: true,
                    header: ["h1", "h2"],
                    params: ["p1", "p2"],
                    cookie: ["c1", "c2"],
                });

                const caches = CACHE["_cache"].get("test_session-test.code");
                expect(Array.isArray(caches) && caches.length === 1).toBeTruthy();
                expect(caches?.[0].response.body).toEqual("test-body");
                expect(caches?.[0].cookie).toEqual({ c1: "cookie-1", c2: "cookie-2", c3: "cookie-3" });
                expect(caches?.[0].header).toEqual({ h1: "header-1", h2: "header-2", h3: "header-3" });
                expect(caches?.[0].param).toEqual({ p1: ["param-1"], p2: ["param-2"], p3: ["param-3"] });
            });

            it("update duplicated value", () => {
                const payload = generatePayload("", "/test/code");
                payload.sessionId = "test_session";
                payload.headers = { h1: "header-1", h2: "header-2", h3: "header-3" };
                payload.cookie = { c1: "cookie-1", c2: "cookie-2", c3: "cookie-3" };
                payload.param = { p1: ["param-1"], p2: ["param-2"], p3: ["param-3"] };
                CACHE.writeCache(payload, generateResponse(HTTP_STATUS_CODE.OK, "test-body-1"), {
                    type: "full",
                    session: true,
                    header: ["h1", "h2"],
                    params: ["p1", "p2"],
                    cookie: ["c1", "c2"],
                });

                CACHE.writeCache(payload, generateResponse(HTTP_STATUS_CODE.OK, "test-body-2"), {
                    type: "full",
                    session: true,
                    header: ["h1", "h2"],
                    params: ["p1", "p2"],
                    cookie: ["c1", "c2"],
                });

                const caches = CACHE["_cache"].get("test_session-test.code");
                expect(Array.isArray(caches) && caches.length === 1).toBeTruthy();
                expect(caches?.[0].response.body).toEqual("test-body-2");
                expect(caches?.[0].cookie).toEqual({ c1: "cookie-1", c2: "cookie-2", c3: "cookie-3" });
                expect(caches?.[0].header).toEqual({ h1: "header-1", h2: "header-2", h3: "header-3" });
                expect(caches?.[0].param).toEqual({ p1: ["param-1"], p2: ["param-2"], p3: ["param-3"] });
            });

            it("only change full mapped item", () => {
                const payload = generatePayload("", "/test/code");
                payload.sessionId = "test_session";
                payload.headers = { h1: "header-1", h2: "header-2", h3: "header-3" };
                payload.cookie = { c1: "cookie-1", c2: "cookie-2", c3: "cookie-3" };
                payload.param = { p1: ["param-1"], p2: ["param-2"], p3: ["param-3"] };

                const checkCacheItem = (cache: RequestCacheDocument, body?: string, req?: string) => {
                    expect(cache.req).toEqual(req);
                    expect(cache.response.body).toEqual(body);
                };

                const prepration = () => {
                    CACHE.writeCache(payload, generateResponse(HTTP_STATUS_CODE.OK, "test-body-1"), {
                        type: "custom",
                        session: true,
                    });
                    CACHE.writeCache(payload, generateResponse(HTTP_STATUS_CODE.OK, "test-body-2"), {
                        type: "custom",
                        session: true,
                        header: ["h1", "h2"],
                    });
                    CACHE.writeCache(payload, generateResponse(HTTP_STATUS_CODE.OK, "test-body-3"), {
                        type: "custom",
                        session: true,
                        header: ["h1", "h2"],
                        params: ["p1", "p2"],
                    });
                    CACHE.writeCache(payload, generateResponse(HTTP_STATUS_CODE.OK, "test-body-4"), {
                        type: "custom",
                        session: true,
                        header: ["h1", "h2"],
                        params: ["p1", "p2"],
                        cookie: ["c1", "c2"],
                    });
                    CACHE.writeCache({ ...payload, body: "test-req" }, generateResponse(HTTP_STATUS_CODE.OK, "test-body-4"), {
                        type: "custom",
                        session: true,
                        header: ["h1", "h2"],
                        params: ["p1", "p2"],
                        cookie: ["c1", "c2"],
                    });

                    const caches = CACHE["_cache"].get("test_session-test.code");
                    expect(Array.isArray(caches) && caches.length === 5).toBeTruthy();
                    if (caches) {
                        checkCacheItem(caches[0], "test-body-4", "test-req");
                        checkCacheItem(caches[1], "test-body-4");
                        checkCacheItem(caches[2], "test-body-3");
                        checkCacheItem(caches[3], "test-body-2");
                        checkCacheItem(caches[4], "test-body-1");
                    }
                };

                prepration();

                CACHE.writeCache({ ...payload, body: "test-req" }, generateResponse(HTTP_STATUS_CODE.OK, "test-body-4-2"), {
                    type: "custom",
                    session: true,
                    header: ["h1", "h2"],
                    params: ["p1", "p2"],
                    cookie: ["c1", "c2"],
                });

                const caches = CACHE["_cache"].get("test_session-test.code");
                expect(Array.isArray(caches) && caches.length === 5).toBeTruthy();
                expect(caches?.[0].response.body).toEqual("test-body-4-2");
                expect(caches?.[0].cookie).toEqual({ c1: "cookie-1", c2: "cookie-2" });
                expect(caches?.[0].header).toEqual({ h1: "header-1", h2: "header-2" });
                expect(caches?.[0].param).toEqual({ p1: ["param-1"], p2: ["param-2"] });
            });
        });

        describe("readCache", () => {
            it("no option provided", async () => {
                jest.spyOn(CACHE as any, "formatKey");
                const response = await CACHE.readCache(generatePayload());
                expect(response).toBeNull();
                expect(CACHE["formatKey"]).not.toHaveBeenCalled();
            });

            it("not cache", async () => {
                jest.spyOn(CACHE as any, "formatKey");
                const payload = generatePayload("", "", true);
                const response = await CACHE.readCache(payload, {
                    type: "url",
                });
                expect(response).toBeNull();
                expect(CACHE["formatKey"]).not.toHaveBeenCalled();
            });

            it("read if url not exist", async () => {
                const cache = await CACHE.readCache(generatePayload("", "/test/code"), {
                    type: "url",
                });
                expect(cache).toBeNull();
            });

            it("get from cache", async () => {
                const payload = generatePayload("", "/test/code");
                payload.sessionId = "test_session";
                payload.headers = { h1: "header-1", h2: "header-2", h3: "header-3" };
                payload.cookie = { c1: "cookie-1", c2: "cookie-2", c3: "cookie-3" };
                payload.param = { p1: ["param-1"], p2: ["param-2"], p3: ["param-3"] };

                const checkCacheItem = (cache: RequestCacheDocument, body?: string, req?: string) => {
                    expect(cache.req).toEqual(req);
                    expect(cache.response.body).toEqual(body);
                };

                const prepration = () => {
                    CACHE.writeCache(payload, generateResponse(HTTP_STATUS_CODE.OK, "test-body-1"), {
                        type: "custom",
                    });
                    CACHE.writeCache(payload, generateResponse(HTTP_STATUS_CODE.OK, "test-body-2"), {
                        type: "custom",
                        header: ["h1", "h2"],
                    });
                    CACHE.writeCache(payload, generateResponse(HTTP_STATUS_CODE.OK, "test-body-3"), {
                        type: "custom",
                        header: ["h1", "h2"],
                        params: ["p1", "p2"],
                    });
                    CACHE.writeCache(payload, generateResponse(HTTP_STATUS_CODE.OK, "test-body-4"), {
                        type: "custom",
                        header: ["h1", "h2"],
                        params: ["p1", "p2"],
                        cookie: ["c1", "c2"],
                    });
                    CACHE.writeCache({ ...payload, body: "test-req" }, generateResponse(HTTP_STATUS_CODE.OK, "test-body-5"), {
                        type: "custom",
                        header: ["h1", "h2"],
                        params: ["p1", "p2"],
                        cookie: ["c1", "c2"],
                    });

                    const caches = CACHE["_cache"].get("test.code");
                    expect(Array.isArray(caches) && caches.length === 5).toBeTruthy();
                    if (caches) {
                        checkCacheItem(caches[0], "test-body-5", "test-req");
                        checkCacheItem(caches[1], "test-body-4");
                        checkCacheItem(caches[2], "test-body-3");
                        checkCacheItem(caches[3], "test-body-2");
                        checkCacheItem(caches[4], "test-body-1");
                    }
                };

                const readAndCheck = async (
                    req: string | undefined,
                    target: string | undefined,
                    option: HttpRequestCacheOption,
                ) => {
                    const cache = await CACHE.readCache({ ...payload, body: req }, option);
                    expect(cache?.body).toEqual(target);
                };

                prepration();

                await readAndCheck("test-req", "test-body-5", {
                    type: "custom",
                    header: ["h1", "h2"],
                    params: ["p1", "p2"],
                    cookie: ["c1", "c2"],
                });
                await readAndCheck(undefined, "test-body-4", {
                    type: "custom",
                    header: ["h1", "h2"],
                    params: ["p1", "p2"],
                    cookie: ["c1", "c2"],
                });
                await readAndCheck("test-req", undefined, {
                    type: "custom",
                    header: ["h1", "h2"],
                    params: ["p1", "p3"],
                    cookie: ["c1", "c2"],
                });
            });

            it("get a timeout cache", async () => {
                const payload = generatePayload("", "/test/code");
                payload.sessionId = "test_session";
                payload.headers = { h1: "header-1", h2: "header-2", h3: "header-3" };
                payload.cookie = { c1: "cookie-1", c2: "cookie-2", c3: "cookie-3" };
                payload.param = { p1: ["param-1"], p2: ["param-2"], p3: ["param-3"] };

                CACHE["_cache"].set("test.code", [
                    {
                        time: 0,
                        req: undefined,
                        cookie: { c1: "cookie-1" },
                        header: { h1: "header-1" },
                        param: { p1: ["param-1"] },
                        response: {
                            statusCode: HTTP_STATUS_CODE.OK,
                            headers: {},
                            body: "test-body",
                        },
                    },
                ]);

                expect(CACHE["_cache"].get("test.code")?.length).toEqual(1);

                const cache = await CACHE.readCache(
                    { ...payload },
                    {
                        type: "custom",
                        header: ["h1"],
                        params: ["p1"],
                        cookie: ["c1"],
                    },
                );
                expect(cache).toBeNull();
                expect(CACHE["_cache"].get("test.code")?.length).toEqual(0);
            });

            it("get a timeout cache - 2", async () => {
                const payload = generatePayload("", "/test/code");
                payload.sessionId = "test_session";
                payload.headers = { h1: "header-1", h2: "header-2", h3: "header-3" };
                payload.cookie = { c1: "cookie-1", c2: "cookie-2", c3: "cookie-3" };
                payload.param = { p1: ["param-1"], p2: ["param-2"], p3: ["param-3"] };

                CACHE["_cache"].set("test.code", [
                    {
                        time: Date.now(),
                        req: "req-1",
                        cookie: { c1: "cookie-1" },
                        header: { h1: "header-1" },
                        param: { p1: ["param-1"] },
                        response: {
                            statusCode: HTTP_STATUS_CODE.OK,
                            headers: {},
                            body: "test-body",
                        },
                    },
                    {
                        time: 0,
                        req: undefined,
                        cookie: { c1: "cookie-1" },
                        header: { h1: "header-1" },
                        param: { p1: ["param-1"] },
                        response: {
                            statusCode: HTTP_STATUS_CODE.OK,
                            headers: {},
                            body: "test-body",
                        },
                    },
                    {
                        time: Date.now(),
                        req: "req-2",
                        cookie: { c1: "cookie-1" },
                        header: { h1: "header-1" },
                        param: { p1: ["param-1"] },
                        response: {
                            statusCode: HTTP_STATUS_CODE.OK,
                            headers: {},
                            body: "test-body",
                        },
                    },
                ]);

                expect(CACHE["_cache"].get("test.code")?.length).toEqual(3);

                const cache = await CACHE.readCache(
                    { ...payload },
                    {
                        type: "custom",
                        header: ["h1"],
                        params: ["p1"],
                        cookie: ["c1"],
                    },
                );
                expect(cache).toBeNull();
                expect(CACHE["_cache"].get("test.code")?.length).toEqual(2);
                expect(CACHE["_cache"].get("test.code")?.[0].req).toEqual("req-1");
                expect(CACHE["_cache"].get("test.code")?.[1].req).toEqual("req-2");
            });
        });
    });

    describe("database cache", () => {
        const CACHE = new RequestCacheHandler({ type: "database", ...DB_OPT });

        describe("writeCache", () => {
            it("call db interface directly", () => {
                jest.spyOn(CACHE as any, "formatKey");
                CACHE.writeCache(generatePayload(), generateResponse(), { type: "url" });
                expect(CACHE["formatKey"]).not.toHaveBeenCalled();
                expect(DB_OPT.writer).toHaveBeenCalled();
            });
        });

        describe("readCache", () => {
            it("call db interface directly - null return", async () => {
                jest.spyOn(CACHE as any, "formatKey");
                DB_OPT.reader.mockReturnValue(Promise.resolve(null));
                const response = await CACHE.readCache(generatePayload(), { type: "url" });
                expect(response).toBeNull();
                expect(CACHE["formatKey"]).not.toHaveBeenCalled();
                expect(DB_OPT.reader).toHaveBeenCalled();
            });

            it("call db interface directly - valid value return", async () => {
                jest.spyOn(CACHE as any, "formatKey");
                DB_OPT.reader.mockReturnValue(
                    Promise.resolve({ statusCode: HTTP_STATUS_CODE.OK, body: "test-body", headers: {} }),
                );
                const response = await CACHE.readCache(generatePayload(), { type: "url" });
                expect(response).toBeDefined();
                expect(response?.body).toEqual("test-body");
                expect(CACHE["formatKey"]).not.toHaveBeenCalled();
                expect(DB_OPT.reader).toHaveBeenCalled();
            });

            it("null if reader not provides", async () => {
                const Cache = new RequestCacheHandler({ type: "database" });
                jest.spyOn(Cache as any, "formatKey");
                const response = await Cache.readCache(generatePayload(), { type: "url" });
                expect(response).toBeNull();
                expect(Cache["formatKey"]).not.toHaveBeenCalled();
            });
        });
    });

    describe("private functions", () => {
        const CACHE = new RequestCacheHandler({ type: "local" });

        beforeEach(() => {
            CACHE.destroy();
        });

        it("formatUrl", () => {
            expect(CACHE["formatUrl"]("")).toEqual("");
            expect(CACHE["formatUrl"]("/")).toEqual("");
            expect(CACHE["formatUrl"]("/test/code/debug")).toEqual("test.code.debug");
        });
    });

    describe("cycle", () => {
        let SET_IVL_SPYON: jest.SpyInstance;

        beforeEach(() => {
            jest.spyOn(globalThis, "clearInterval").mockImplementation(() => ({}));
            SET_IVL_SPYON = jest.spyOn(globalThis, "setInterval").mockImplementation(() => ({} as any));
        });

        describe("start", () => {
            it("normal case - 1", () => {
                const CACHE = new RequestCacheHandler({ type: "database", ...DB_OPT });

                CACHE["_timer"] = {} as any;

                expect(CACHE["_timer"]).toBeDefined();

                let timeout = 0;
                SET_IVL_SPYON.mockImplementation((_: any, time: number) => {
                    timeout = time;
                });

                CACHE.start();

                expect(globalThis.clearInterval).toHaveBeenCalled();
                expect(globalThis.setInterval).toHaveBeenCalled();
                expect(timeout).toEqual(300000 * 10);
            });

            it("normal case - 2", () => {
                const CACHE = new RequestCacheHandler({ type: "database", ...DB_OPT, watch: 100 });
                expect(CACHE["_timer"]).toBeNull();

                let timeout = 0;
                SET_IVL_SPYON.mockImplementation((_: any, time: number) => {
                    timeout = time;
                });

                CACHE.start();

                expect(globalThis.clearInterval).not.toHaveBeenCalled();
                expect(globalThis.setInterval).toHaveBeenCalled();
                expect(timeout).toEqual(100);
            });
        });

        describe("destroy", () => {
            it("normal case - 1", () => {
                const CACHE = new RequestCacheHandler({ type: "database", ...DB_OPT });
                CACHE["_timer"] = {} as any;
                expect(CACHE["_timer"]).toBeDefined();

                CACHE.destroy();

                expect(globalThis.clearInterval).toHaveBeenCalled();
                expect(DB_OPT.clean).toHaveBeenCalled();
            });

            it("normal case - 2", () => {
                const CACHE = new RequestCacheHandler({ type: "database", ...DB_OPT });
                expect(CACHE["_timer"]).toBeNull();

                CACHE.destroy();

                expect(globalThis.clearInterval).not.toHaveBeenCalled();
                expect(DB_OPT.clean).toHaveBeenCalled();
            });
        });
    });
});

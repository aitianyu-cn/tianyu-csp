/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { REST_REQUEST_ITEM_MAP } from "#core/handler/RestHandlerConstant";
import { DEFAULT_REST_REQUEST_ITEM_MAP } from "#core/infra/Constant";
import { createContributor } from "#core/InfraLoader";
import { Http2Service } from "#core/service/Http2Service";
import { HttpService } from "#core/service/HttpService";
import {
    DefaultRequestItemsMap,
    DefaultRequestItemTargetType,
    HTTP_STATUS_CODE,
    NetworkServiceResponseData,
    OperationError,
    PathEntry,
    REQUEST_HANDLER_MODULE_ID,
    RequestPayloadData,
} from "#interface";
import { readFileSync } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import { createServer } from "https";
import * as COMMON from "packages/Common";
import path from "path";
import { TimerTools } from "test/tools/TimerTools";

const PROXY_HTTP = 30010;
const PROXY_HTTPS = 30020;
const PROXY_HTTP2 = 30030;

const SEC_CERT = readFileSync(path.join(process.cwd(), ".config/localhost+2.pem"), "utf-8");
const SEC_KEY = readFileSync(path.join(process.cwd(), ".config/localhost+2-key.pem"), "utf-8");

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.RemoteProcedures", () => {
    it("http not safe", (done) => {
        jest.spyOn(COMMON, "getInDevMode").mockReturnValue(false);

        TIANYU.import.MODULE.RPC.call(
            {
                host: "",
                url: "",
                protocol: "http",
                method: "GET",
                param: {},
                header: {},
                cookies: {},
                body: undefined,
            },
            (input) => input,
        ).then(
            () => {
                done.fail();
            },
            (reason: OperationError) => {
                expect(reason.code).toEqual(SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR);
                done();
            },
        );
    });

    describe("connect tests", () => {
        const contributor_http = createContributor();
        const Mock_RequestHandler_http = {
            item: (payload: { name: keyof DefaultRequestItemsMap; type: DefaultRequestItemTargetType }): string => {
                const c_item = REST_REQUEST_ITEM_MAP[payload.name];
                const d_item = DEFAULT_REST_REQUEST_ITEM_MAP[payload.name];

                const item = c_item || d_item || "";
                if (typeof item === "string") {
                    return item;
                }

                return item[payload.type];
            },
            dispatch: async (data: any): Promise<NetworkServiceResponseData> => {
                const { payload } = data as {
                    rest: PathEntry;
                    payload: RequestPayloadData;
                };
                return {
                    statusCode: HTTP_STATUS_CODE.OK,
                    headers: {},
                    body: payload,
                };
            },
        };
        const HttpServer = new HttpService(
            {
                host: "localhost",
                port: PROXY_HTTP,
                cache: {
                    type: "local",
                },
            },
            contributor_http,
        );

        const https_lisenter = jest.fn<void, [IncomingMessage, ServerResponse]>((_, res) => {
            res.statusCode = 200;
            res.write("hello world!");
            res.end();
        });
        const HttpsServer = createServer({ key: SEC_KEY, cert: SEC_CERT }, https_lisenter);

        const contributor_http2 = createContributor();
        const Mock_RequestHandler_http2 = {
            item: (payload: { name: keyof DefaultRequestItemsMap; type: DefaultRequestItemTargetType }): string => {
                const c_item = REST_REQUEST_ITEM_MAP[payload.name];
                const d_item = DEFAULT_REST_REQUEST_ITEM_MAP[payload.name];

                const item = c_item || d_item || "";
                if (typeof item === "string") {
                    return item;
                }

                return item[payload.type];
            },
            dispatch: async (data: any): Promise<NetworkServiceResponseData> => {
                const { payload } = data as {
                    rest: PathEntry;
                    payload: RequestPayloadData;
                };
                return {
                    statusCode: HTTP_STATUS_CODE.OK,
                    headers: {},
                    body: payload,
                };
            },
        };
        const Http2Server = new Http2Service(
            {
                key: SEC_KEY,
                cert: SEC_CERT,
                host: "localhost",
                port: PROXY_HTTP2,
                cache: {
                    type: "local",
                },
            },
            contributor_http2,
        );

        beforeAll(async () => {
            (global as any).TIANYU_TEST_HTTPS_UNAUTH = true;

            HttpServer.listen();
            HttpsServer.listen(PROXY_HTTPS, "localhost");
            Http2Server.listen();

            // waiting for server port established
            await TimerTools.sleep(1000);
        }, 50000);

        afterAll(async () => {
            HttpServer.close();
            HttpsServer.close();
            Http2Server.close();

            // waiting for server closed
            await TimerTools.sleep(1000);
        }, 500000);

        let HTTP_DISPATCH_SPY: jest.SpyInstance;
        let HTTP2_DISPATCH_SPY: jest.SpyInstance;

        beforeEach(() => {
            HTTP_DISPATCH_SPY = jest.spyOn(Mock_RequestHandler_http, "dispatch");
            contributor_http.exportModule(
                "request-handler.dispatcher",
                REQUEST_HANDLER_MODULE_ID,
                Mock_RequestHandler_http.dispatch,
            );
            contributor_http.exportModule(
                "request-handler.items-getter",
                REQUEST_HANDLER_MODULE_ID,
                Mock_RequestHandler_http.item,
            );

            HTTP2_DISPATCH_SPY = jest.spyOn(Mock_RequestHandler_http2, "dispatch");
            contributor_http2.exportModule(
                "request-handler.dispatcher",
                REQUEST_HANDLER_MODULE_ID,
                Mock_RequestHandler_http2.dispatch,
            );
            contributor_http2.exportModule(
                "request-handler.items-getter",
                REQUEST_HANDLER_MODULE_ID,
                Mock_RequestHandler_http2.item,
            );
        });

        afterEach(() => {
            contributor_http.unexportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
            contributor_http.unexportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);

            contributor_http2.unexportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
            contributor_http2.unexportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);
        });

        describe("http", () => {
            it("success", async () => {
                HTTP_DISPATCH_SPY.mockImplementation(async (_data: any): Promise<NetworkServiceResponseData> => {
                    return {
                        statusCode: HTTP_STATUS_CODE.OK,
                        headers: { counter: "1" },
                        body: "hello world",
                    };
                });

                const res = await TIANYU.import.MODULE.RPC.call(
                    {
                        host: "localhost:30010",
                        url: "/",
                        protocol: "http",
                        method: "GET",
                        param: {},
                        header: {},
                        cookies: {},
                        body: undefined,
                    },
                    (input) => input,
                );
                expect(res).toEqual("hello world");
            });

            it("failed", (done) => {
                HTTP_DISPATCH_SPY.mockImplementation(async (_data: any): Promise<NetworkServiceResponseData> => {
                    return {
                        statusCode: HTTP_STATUS_CODE.NOT_FOUND,
                        headers: { counter: "1" },
                        body: "hello world",
                    };
                });

                jest.spyOn(TIANYU.logger, "warn");

                TIANYU.import.MODULE.RPC.call(
                    {
                        host: "localhost:30010",
                        url: "/",
                        protocol: "http",
                        method: "GET",
                        param: {},
                        header: {},
                        cookies: {},
                        body: undefined,
                    },
                    (input) => input,
                ).then(
                    () => {
                        done.fail();
                    },
                    (reason: OperationError) => {
                        expect(TIANYU.logger.warn).toHaveBeenCalled();
                        expect(reason.code).toEqual(SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR);
                        done();
                    },
                );
            });
        });

        describe("https", () => {
            it("success", async () => {
                https_lisenter.mockImplementation((_, res) => {
                    res.statusCode = 200;
                    res.setHeader("counter", "2");
                    res.write("https - hello world!");
                    res.end();
                });

                const res = await TIANYU.import.MODULE.RPC.call(
                    {
                        host: "localhost:30020",
                        url: "/",
                        protocol: "https",
                        method: "GET",
                        param: {},
                        header: {},
                        cookies: {},
                        body: undefined,
                    },
                    (input) => input,
                );
                expect(res).toEqual("https - hello world!");
            });

            it("failed", (done) => {
                https_lisenter.mockImplementation((_, res) => {
                    res.statusCode = HTTP_STATUS_CODE.NOT_FOUND;
                    res.setHeader("counter", "2");
                    res.write("https - hello world!");
                    res.end();
                });

                jest.spyOn(TIANYU.logger, "warn");

                TIANYU.import.MODULE.RPC.call(
                    {
                        host: "localhost:30020",
                        url: "/",
                        protocol: "https",
                        method: "GET",
                        param: {},
                        header: {},
                        cookies: {},
                        body: undefined,
                    },
                    (input) => input,
                ).then(
                    () => {
                        done.fail();
                    },
                    (reason: OperationError) => {
                        expect(TIANYU.logger.warn).toHaveBeenCalled();
                        expect(reason.code).toEqual(SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR);
                        done();
                    },
                );
            });
        });

        describe("http2", () => {
            it("get request", async () => {
                HTTP2_DISPATCH_SPY.mockImplementation(async (_data: any): Promise<NetworkServiceResponseData> => {
                    return {
                        statusCode: HTTP_STATUS_CODE.OK,
                        headers: { counter: "3" },
                        body: "http2 - hello world!",
                    };
                });

                const res = await TIANYU.import.MODULE.RPC.call(
                    {
                        host: "localhost:30030",
                        url: "/",
                        protocol: "http2",
                        method: "GET",
                        param: {},
                        header: {},
                        cookies: {},
                        body: undefined,
                    },
                    (input) => input,
                );
                expect(res).toEqual("http2 - hello world!");
            });

            it("post request", async () => {
                HTTP2_DISPATCH_SPY.mockImplementation(async (data: any): Promise<NetworkServiceResponseData> => {
                    const { payload } = data as {
                        rest: PathEntry;
                        payload: RequestPayloadData;
                    };
                    return {
                        statusCode: HTTP_STATUS_CODE.OK,
                        headers: { counter: "3" },
                        body: payload.body?.a,
                    };
                });

                const res = await TIANYU.import.MODULE.RPC.call(
                    {
                        host: "localhost:30030",
                        url: "/",
                        protocol: "http2",
                        method: "POST",
                        param: {},
                        header: {},
                        cookies: {},
                        body: { a: "test" },
                    },
                    (input) => input,
                );
                expect(res).toEqual("test");
            });
        });

        it("transformer failed", async () => {
            jest.spyOn(TIANYU.logger, "warn");

            const res = await TIANYU.import.MODULE.RPC.call(
                {
                    host: "localhost:30010",
                    url: "/",
                    protocol: "http",
                    method: "GET",
                    param: {},
                    header: {},
                    cookies: {},
                    body: undefined,
                },
                () => {
                    throw new Error("test-transform-error");
                },
            );

            expect(res).toBeNull();
            expect(TIANYU.logger.warn).toHaveBeenCalled();
        });
    });
});

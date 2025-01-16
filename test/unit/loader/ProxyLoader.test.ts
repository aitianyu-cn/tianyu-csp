/** @format */

import path from "path";
import { readFileSync } from "fs";
import { REST_REQUEST_ITEM_MAP } from "#core/handler/RestHandlerConstant";
import { DEFAULT_REST_REQUEST_ITEM_MAP } from "#core/infra/Constant";
import { createContributor, generateInfra } from "#core/InfraLoader";
import {
    DefaultRequestItemsMap,
    DefaultRequestItemTargetType,
    NetworkServiceResponseData,
    PathEntry,
    RequestPayloadData,
    HTTP_STATUS_CODE,
    REQUEST_HANDLER_MODULE_ID,
    HttpProtocal,
} from "#interface";
import { HttpService } from "#core/service/HttpService";
import { IncomingMessage, ServerResponse } from "http";
import { createServer } from "https";
import { Http2Service } from "#core/service/Http2Service";
import { TimerTools } from "test/tools/TimerTools";
import { AreaCode, MapOfString } from "@aitianyu.cn/types";
import { GenericRequestManager } from "#core/infra/RequestManager";
import { SessionManager } from "#core/infra/SessionManager";
import * as COMMON from "packages/Common";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { proxy } from "packages/default-loader";

const PROXY_HTTP = 30010;
const PROXY_HTTPS = 30020;
const PROXY_HTTP2 = 30030;

const SEC_CERT = readFileSync(path.join(process.cwd(), ".config/localhost+2.pem"), "utf-8");
const SEC_KEY = readFileSync(path.join(process.cwd(), ".config/localhost+2-key.pem"), "utf-8");

function registerGlobalTIANYU(
    host: string,
    url: string,
    protocol: HttpProtocal,
    headers: MapOfString,
    param: MapOfString,
    body?: any,
): void {
    const requestPayload: RequestPayloadData = {
        url,
        host,
        body,
        param,
        headers,
        protocol,
        serviceId: "",
        requestId: "",
        sessionId: "",
        disableCache: true,
        type: "http",
        language: AreaCode.unknown,
        cookie: {},
    };
    const reqMgr = new GenericRequestManager(requestPayload);
    const sessMgr = new SessionManager(reqMgr);
    const tianyu = generateInfra(sessMgr, reqMgr);

    (global as any).TIANYU = tianyu;
}

describe("aitianyu-cn.node-module.tianyu-csp.unit.loader.ProxyLoader", () => {
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

        contributor_http.exportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID, Mock_RequestHandler_http.dispatch);
        contributor_http.exportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID, Mock_RequestHandler_http.item);

        HTTP2_DISPATCH_SPY = jest.spyOn(Mock_RequestHandler_http2, "dispatch");
        contributor_http2.exportModule(
            "request-handler.dispatcher",
            REQUEST_HANDLER_MODULE_ID,
            Mock_RequestHandler_http2.dispatch,
        );
        contributor_http2.exportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID, Mock_RequestHandler_http2.item);
    });

    afterEach(() => {
        contributor_http.unexportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
        contributor_http.unexportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);

        contributor_http2.unexportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
        contributor_http2.unexportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);
    });

    describe("http", () => {
        it("success", async () => {
            registerGlobalTIANYU("localhost:30010", "/", "http", {}, {});
            HTTP_DISPATCH_SPY.mockImplementation(async (_data: any): Promise<NetworkServiceResponseData> => {
                return {
                    statusCode: HTTP_STATUS_CODE.OK,
                    headers: { counter: "1" },
                    body: "hello world",
                };
            });

            const res = await proxy();
            expect(res.body).toEqual("hello world");
            expect(res.headers["counter"]).toEqual("1");
        });

        it("failed", async () => {
            registerGlobalTIANYU("localhost:30010", "/", "http", {}, {});
            HTTP_DISPATCH_SPY.mockImplementation(async (_data: any): Promise<NetworkServiceResponseData> => {
                return {
                    statusCode: HTTP_STATUS_CODE.NOT_FOUND,
                    headers: { counter: "1" },
                    body: "hello world",
                };
            });

            jest.spyOn(TIANYU.logger, "warn");

            const res = await proxy();

            expect(res.statusCode).toEqual(HTTP_STATUS_CODE.NOT_FOUND);
            expect(TIANYU.logger.warn).toHaveBeenCalled();
        });

        it("http not safe", async () => {
            jest.spyOn(COMMON, "getInDevMode").mockReturnValue(false);
            registerGlobalTIANYU("localhost:30010", "/", "http", {}, {});

            const res = await proxy();
            expect(res.statusCode).toEqual(HTTP_STATUS_CODE.BAD_REQUEST);
            expect(res.body.code).toEqual(SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR);
        });
    });

    it("https", async () => {
        registerGlobalTIANYU("localhost:30020", "/", "https", {}, {});
        https_lisenter.mockImplementation((_, res) => {
            res.statusCode = 200;
            res.setHeader("counter", "2");
            res.write("https - hello world!");
            res.end();
        });

        const res = await proxy();
        expect(res.body).toEqual("https - hello world!");
        expect(res.headers["counter"]).toEqual("2");
    });

    describe("http2", () => {
        it("single request", async () => {
            registerGlobalTIANYU("localhost:30030", "/", "http2", {}, {});
            HTTP2_DISPATCH_SPY.mockImplementation(async (_data: any): Promise<NetworkServiceResponseData> => {
                return {
                    statusCode: HTTP_STATUS_CODE.OK,
                    headers: { counter: "3" },
                    body: "http2 - hello world!",
                };
            });

            const res = await proxy();
            expect(res.body).toEqual("http2 - hello world!");
            expect(res.headers["counter"]).toEqual("3");
        });

        it("batch query", async () => {
            registerGlobalTIANYU(
                "localhost:30030",
                "/",
                "http2",
                {},
                {},
                {
                    queries: [{ param: { TEST: "true" } }, { path: "/test_invalid_path" }, { body: "test-req-body" }],
                },
            );

            let counter = 0;
            HTTP2_DISPATCH_SPY.mockImplementation(async (data: any): Promise<NetworkServiceResponseData> => {
                const { payload } = data as {
                    rest: PathEntry;
                    payload: RequestPayloadData;
                };
                return {
                    statusCode: HTTP_STATUS_CODE.OK,
                    headers: {},
                    body: `http2 - ${++counter} hello world!`,
                };
            });

            const res = await proxy();
            const queries = JSON.parse(res.body);
            expect(Array.isArray(queries)).toBeTruthy();
            expect(queries.length).toEqual(3);

            expect((queries[0] as NetworkServiceResponseData).statusCode).toEqual(HTTP_STATUS_CODE.OK);
            expect((queries[0] as NetworkServiceResponseData).body).toEqual("http2 - 1 hello world!");

            expect((queries[1] as NetworkServiceResponseData).statusCode).toEqual(HTTP_STATUS_CODE.NOT_FOUND);

            expect((queries[2] as NetworkServiceResponseData).statusCode).toEqual(HTTP_STATUS_CODE.OK);
            expect((queries[2] as NetworkServiceResponseData).body).toEqual("http2 - 2 hello world!");
        });
    });
});

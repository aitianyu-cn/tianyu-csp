/** @format */

import { REST_REQUEST_ITEM_MAP } from "#core/handler/RestHandlerConstant";
import { DEFAULT_REST_REQUEST_ITEM_MAP } from "#core/infra/Constant";
import { createContributor } from "#core/InfraLoader";
import { Http2Service } from "#core/service/Http2Service";
import {
    DefaultRequestItemsMap,
    DefaultRequestItemTargetType,
    NetworkServiceResponseData,
    PathEntry,
    RequestPayloadData,
    HTTP_STATUS_CODE,
    REQUEST_HANDLER_MODULE_ID,
} from "#interface";
import { readFileSync } from "fs";
import path from "path";
import { SERVICE_HOST, SERVICE_PORT } from "test/content/HttpConstant";
import { TimerTools } from "test/tools/TimerTools";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.service.Http2Service", () => {
    const key = readFileSync(path.join(process.cwd(), ".config/localhost+2-key.pem"), "utf-8");
    const cert = readFileSync(path.join(process.cwd(), ".config/localhost+2.pem"), "utf-8");
    const contributor = createContributor();
    const Mock_RequestHandler = {
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
    let DISPATCH_SPY: any = null;
    let SERVICE: any = null;

    beforeAll((done) => {
        SERVICE = new Http2Service(
            {
                key,
                cert,
                host: SERVICE_HOST,
                port: SERVICE_PORT,
                cache: {
                    type: "local",
                },
            },
            contributor,
        );

        process.on("unhandledRejection", (e) => {
            console.log(e);
        });

        process.on("uncaughtException", (e) => {
            console.log(e);
        });

        SERVICE.listen(done);
    });

    afterAll(async () => {
        SERVICE?.close();

        await TimerTools.sleep(1000);
    }, 50000);

    beforeEach(() => {
        DISPATCH_SPY = jest.spyOn(Mock_RequestHandler, "dispatch");

        contributor.exportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID, Mock_RequestHandler.dispatch);
        contributor.exportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID, Mock_RequestHandler.item);
    });

    afterEach(() => {
        contributor.unexportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
        contributor.unexportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);
    });

    it("id", () => {
        expect(SERVICE.id).not.toEqual("");
    });

    it("type", () => {
        expect(SERVICE.type).toEqual("http");
    });

    it("protocol", () => {
        expect(SERVICE.protocol).toEqual("http2");
    });

    describe("get", () => {
        it("get success", async () => {
            DISPATCH_SPY.mockImplementation(async (data: any): Promise<NetworkServiceResponseData> => {
                const { payload } = data as {
                    rest: PathEntry;
                    payload: RequestPayloadData;
                };
                return {
                    statusCode: HTTP_STATUS_CODE.OK,
                    headers: {},
                    body: payload,
                };
            });

            const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test", "GET");
            client.setParameter({ TEST: "true" });
            client.setPort(SERVICE_PORT);
            client.setOption({ rejectUnauthorized: false });

            await client.send();

            const res = client.response;
            expect(res.param["TEST"]).toEqual("true");
            expect(DISPATCH_SPY).toHaveBeenCalled();
        }, 50000);

        it("get success - in string response", async () => {
            DISPATCH_SPY.mockImplementation(async (data: any): Promise<NetworkServiceResponseData> => {
                return {
                    statusCode: HTTP_STATUS_CODE.OK,
                    headers: {},
                    body: "response",
                };
            });

            const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test", "GET");
            client.setParameter({ TEST: "true" });
            client.setPort(SERVICE_PORT);
            client.setOption({ rejectUnauthorized: false });

            await client.send();

            expect(client.raw).toEqual("response");
            expect(DISPATCH_SPY).toHaveBeenCalled();
        }, 50000);

        it("path not valid", async () => {
            const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test_not_valid", "GET");
            client.setParameter({ TEST: "true" });
            client.setPort(SERVICE_PORT);
            client.setOption({ rejectUnauthorized: false });

            await client.send();

            expect(client.status).toEqual(HTTP_STATUS_CODE.NOT_FOUND);
            expect(DISPATCH_SPY).not.toHaveBeenCalled();
        }, 50000);

        it("execution error", async () => {
            DISPATCH_SPY.mockImplementation(() => Promise.reject());

            const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test", "GET");
            client.setParameter({ TEST: "true" });
            client.setPort(SERVICE_PORT);
            client.setOption({ rejectUnauthorized: false });

            await client.send();

            expect(client.status).toEqual(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
            expect(DISPATCH_SPY).toHaveBeenCalled();
        }, 50000);

        it("service invalid", async () => {
            contributor.unexportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
            contributor.unexportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);

            const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test", "GET");
            client.setParameter({ TEST: "true" });
            client.setPort(SERVICE_PORT);
            client.setOption({ rejectUnauthorized: false });

            await client.send();

            expect(client.status).toEqual(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
        }, 50000);
    });

    describe("post", () => {
        it("success", async () => {
            DISPATCH_SPY.mockImplementation(async (data: any): Promise<NetworkServiceResponseData> => {
                const { payload } = data as {
                    rest: PathEntry;
                    payload: RequestPayloadData;
                };
                return {
                    statusCode: HTTP_STATUS_CODE.OK,
                    headers: {},
                    body: payload,
                };
            });

            const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test", "POST");
            client.setParameter({ TEST: "true" });
            client.setPort(SERVICE_PORT);
            client.setOption({ rejectUnauthorized: false });
            client.query({ body: "test-query" });

            await client.send();

            const res = client.response;
            expect(res.param["TEST"]).toEqual("true");
            expect(res.body).toEqual("test-query");
            expect(DISPATCH_SPY).toHaveBeenCalled();
        }, 50000);

        it("success - in string response", async () => {
            DISPATCH_SPY.mockImplementation(async (data: any): Promise<NetworkServiceResponseData> => {
                return {
                    statusCode: HTTP_STATUS_CODE.OK,
                    headers: {},
                    body: "response",
                };
            });

            const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test", "POST");
            client.setParameter({ TEST: "true" });
            client.setPort(SERVICE_PORT);
            client.setOption({ rejectUnauthorized: false });
            client.query({ body: "test-query" });

            await client.send();

            expect(client.raw).toEqual("response");
            expect(DISPATCH_SPY).toHaveBeenCalled();
        }, 50000);
        it("path not valid", async () => {
            const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test_not_valid", "POST");
            client.setParameter({ TEST: "true" });
            client.setPort(SERVICE_PORT);
            client.setOption({ rejectUnauthorized: false });
            client.query({ body: "test-query" });

            await client.send();

            expect(client.status).toEqual(HTTP_STATUS_CODE.NOT_FOUND);
            expect(DISPATCH_SPY).not.toHaveBeenCalled();
        }, 50000);

        it("execution error", async () => {
            DISPATCH_SPY.mockImplementation(() => Promise.reject());

            const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test", "POST");
            client.setParameter({ TEST: "true" });
            client.setPort(SERVICE_PORT);
            client.setOption({ rejectUnauthorized: false });
            client.query({ body: "test-query" });

            await client.send();

            expect(client.status).toEqual(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
            expect(DISPATCH_SPY).toHaveBeenCalled();
        }, 50000);

        it("service invalid", async () => {
            contributor.unexportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
            contributor.unexportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);

            const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test", "POST");
            client.setParameter({ TEST: "true" });
            client.setPort(SERVICE_PORT);
            client.setOption({ rejectUnauthorized: false });
            client.query({ body: "test-query" });

            await client.send();

            expect(client.status).toEqual(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
        }, 50000);
    });

    it("invalid method", async () => {
        const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test", "PUT" as any);
        client.setParameter({ TEST: "true" });
        client.setPort(SERVICE_PORT);
        client.setOption({ rejectUnauthorized: false });

        await client.send();

        expect(client.status).toEqual(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED);
        expect(DISPATCH_SPY).not.toHaveBeenCalled();
    }, 50000);

    it("on authorization-changed", () => {
        jest.spyOn(SERVICE["_server"], "setSecureContext").mockImplementation(() => undefined);

        SERVICE.emit("authorization-changed", { key: "test-key-2", cert: "test-cert-2" });

        expect(SERVICE["_server"].setSecureContext).toHaveBeenCalledWith({ key: "test-key-2", cert: "test-cert-2" });
    });
});

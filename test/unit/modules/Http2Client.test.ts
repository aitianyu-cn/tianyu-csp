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
    Http2Query,
} from "#interface";
import { readFileSync } from "fs";
import path from "path";
import { SERVICE_HOST, SERVICE_PORT } from "test/content/HttpConstant";
import { TimerTools } from "test/tools/TimerTools";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.Http2Client", () => {
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

    it("invalid getter result", () => {
        const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test", "GET");

        expect(client.raw).toEqual("");
        expect(client.response).toBeNull();
        expect(client.status).toEqual(-1);
        expect(client.allHeaders()).toEqual({});

        expect(client.getRaw(-1)).toBeNull();
        expect(client.getRaw(100)).toBeNull();

        expect(client.getResponse(-1)).toBeNull();
        expect(client.getResponse(100)).toBeNull();

        expect(client.getStatus(-1)).toEqual(-1);
        expect(client.getStatus(100)).toEqual(-1);

        expect(client.getQuery(-1)).toBeNull();
        expect(client.getQuery(100)).toBeNull();

        expect(client.getHeader(-1)).toEqual({});
        expect(client.getHeader(100)).toEqual({});

        expect(client.multiRaws).toEqual([]);
        expect(client.multiResponses).toEqual([]);
        expect(client.multiStatus).toEqual([]);
    });

    it("invalid response", () => {
        const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test", "GET");
        client["querys"].push({ query: {}, result: "test", status: -1, headers: {} });

        expect(client.response).toBeNull();
    });

    it("setOption", () => {
        const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test", "GET");

        expect(client["_options"]).toBeUndefined();

        client.setOption({ rejectUnauthorized: true });
        expect(client["_options"]).toBeDefined();
        expect(client["_options"]?.rejectUnauthorized).toBeTruthy();

        client.setOption({ timeout: 100 });
        expect(client["_options"]).toBeDefined();
        expect(client["_options"]?.rejectUnauthorized).toBeTruthy();
        expect(client["_options"]?.timeout).toEqual(100);

        client.setOption();
        expect(client["_options"]).toBeDefined();
        expect(client["_options"]?.rejectUnauthorized).toBeTruthy();
        expect(client["_options"]?.timeout).toEqual(100);

        client.setOption({ secureProtocol: "https" }, true);
        expect(client["_options"]).toBeDefined();
        expect(client["_options"]?.rejectUnauthorized).toBeUndefined();
        expect(client["_options"]?.timeout).toBeUndefined();
        expect(client["_options"]?.secureProtocol).toEqual("https");

        client.setOption(undefined, true);
        expect(client["_options"]).toBeUndefined();
    });

    it("multi-querys", async () => {
        let counter = 1;
        DISPATCH_SPY.mockImplementation(async (data: any): Promise<NetworkServiceResponseData> => {
            const { payload } = data as {
                rest: PathEntry;
                payload: RequestPayloadData;
            };
            return {
                statusCode: HTTP_STATUS_CODE.OK,
                headers: { counter: counter++, "content-encoding": "gzip", "content-type": "application/json" },
                body: payload,
            };
        });

        const client = new TIANYU.import.MODULE.Http2Client("localhost", "/test", "GET");
        client.setPort(SERVICE_PORT);
        client.setOption({ rejectUnauthorized: false });

        const querys: Http2Query[] = [
            {
                param: { TEST: "true" },
            },
            {
                path: "/test_invalid_path",
            },
            {
                body: "test-req-body",
                method: "POST",
            },
        ];
        querys.forEach((value) => {
            client.query(value);
        });

        await client.send();

        const multiRaws = client.multiRaws;
        const multiResponses = client.multiResponses;
        const multiStatus = client.multiStatus;

        expect(multiRaws[0]).toEqual(client.getRaw(0));
        expect(multiRaws[1]).toEqual(client.getRaw(1));
        expect(multiRaws[2]).toEqual(client.getRaw(2));

        expect(multiStatus[0]).toEqual(client.getStatus(0));
        expect(multiStatus[1]).toEqual(client.getStatus(1));
        expect(multiStatus[2]).toEqual(client.getStatus(2));

        expect(multiResponses[0].param["TEST"]).toEqual("true");
        expect(multiStatus[1]).toEqual(HTTP_STATUS_CODE.NOT_FOUND);
        expect(multiResponses[2].body).toEqual("test-req-body");

        expect(client.allHeaders()).toEqual(client.getHeader(0));
        expect(client.getHeader(1)["counter"]).toBeUndefined();
        expect(client.getHeader(2)["counter"]).toEqual("2");
    });
});

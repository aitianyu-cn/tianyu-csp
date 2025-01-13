/** @format */

import { REST_REQUEST_ITEM_MAP } from "#core/handler/RestHandlerConstant";
import { Http2Service } from "#core/index";
import { DEFAULT_REST_REQUEST_ITEM_MAP } from "#core/infra/Constant";
import { createContributor } from "#core/InfraLoader";
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
                host: SERVICE_HOST,
                port: SERVICE_PORT,
                key: readFileSync(path.join(process.cwd(), ".config/localhost+2-key.pem"), "utf-8"),
                cert: readFileSync(path.join(process.cwd(), ".config/localhost+2.pem"), "utf-8"),
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
});

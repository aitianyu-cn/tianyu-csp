/** @format */

import { RequestHandler } from "#core/handler/RequestHandler";
import { DISPATCH_HANDLER_MODULE_ID, HTTP_STATUS_CODE, NetworkServiceResponseData, REQUEST_HANDLER_MODULE_ID } from "#interface";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.handler.RequestHandler", () => {
    let REQ_HANDLER: any = null;

    beforeAll(() => {
        REQ_HANDLER = new RequestHandler();
        REQ_HANDLER.initialize();
    });

    afterAll(() => {
        REQ_HANDLER?.destroy();
    });

    it("request-handler.items-getter", () => {
        const method = TIANYU.fwk.contributor.findModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);

        expect(method).toBeDefined();

        if (method) {
            expect(method({ name: "language", type: "cookie" })).toEqual("LANGUAGE");
            expect(method({ name: "session", type: "cookie" })).toEqual("SESSION_ID");
        }
    });

    describe("request-handler.dispatcher", () => {
        it("dispatcher not valid", (done) => {
            const dispatcher = TIANYU.fwk.contributor.findModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
            expect(dispatcher).toBeDefined();

            if (dispatcher) {
                dispatcher({} as any).then(
                    () => {
                        done.fail();
                    },
                    (error) => {
                        expect(error.code).toEqual(HTTP_STATUS_CODE.SERVICE_UNAVAILABLE.toString());
                        expect(error.message).toEqual("request could not be handled");
                        expect(error.error).toEqual("network dispatcher is not inited or not exist.");
                        done();
                    },
                );
            }
        });

        it("success", (done) => {
            TIANYU.fwk.contributor.exportModule(
                "dispatch-handler.network-dispatcher",
                DISPATCH_HANDLER_MODULE_ID,
                function (): Promise<NetworkServiceResponseData> {
                    const result: NetworkServiceResponseData = {
                        statusCode: HTTP_STATUS_CODE.OK,
                        headers: {},
                        body: { data: "test" },
                    };
                    return Promise.resolve(result);
                },
            );

            new Promise<void>((resolve) => {
                const dispatcher = TIANYU.fwk.contributor.findModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
                expect(dispatcher).toBeDefined();

                if (dispatcher) {
                    dispatcher({} as any).then(
                        (result) => {
                            expect(result.statusCode).toEqual(HTTP_STATUS_CODE.OK);
                            expect(result.headers).toEqual({});
                            expect(result.body).toEqual({ data: "test" });
                            resolve();
                        },
                        (error) => {
                            expect(false).toBeTruthy();
                        },
                    );
                }
            }).finally(() => {
                TIANYU.fwk.contributor.unexportModule("dispatch-handler.network-dispatcher", DISPATCH_HANDLER_MODULE_ID);
                done();
            });
        });
    });
});

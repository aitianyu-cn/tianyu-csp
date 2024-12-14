/** @format */

import { DEFAULT_REST_REQUEST_ITEM_MAP } from "#core/infra/Constant";
import { HttpService } from "#core/service/HttpService";
import {
    RequestRestData,
    RequestPayloadData,
    NetworkServiceResponseData,
    HTTP_STATUS_CODE,
    DefaultRequestItemsMap,
    DefaultRequestItemTargetType,
    REQUEST_HANDLER_MODULE_ID,
} from "#interface";
import { REST_REQUEST_ITEM_MAP } from "packages/Common";
import { SERVICE_HOST, SERVICE_PORT } from "test/content/HttpConstant";
import { HttpClient } from "test/tools/HttpClient";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.service.HttpService", () => {
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
                rest: RequestRestData;
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

    beforeAll(() => {
        SERVICE = new HttpService({
            host: SERVICE_HOST,
            port: SERVICE_PORT,
        });

        SERVICE.listen();

        process.on("unhandledRejection", (e) => {
            console.log(e);
        });

        process.on("uncaughtException", (e) => {
            console.log(e);
        });
    });

    afterAll(() => {
        SERVICE?.close();
    }, 50000);

    beforeEach(() => {
        DISPATCH_SPY = jest.spyOn(Mock_RequestHandler, "dispatch");

        TIANYU.fwk.contributor.exportModule(
            "request-handler.dispatcher",
            REQUEST_HANDLER_MODULE_ID,
            Mock_RequestHandler.dispatch,
        );
        TIANYU.fwk.contributor.exportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID, Mock_RequestHandler.item);
    });

    afterEach(() => {
        TIANYU.fwk.contributor.unexportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
        TIANYU.fwk.contributor.unexportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);
    });

    it("id", () => {
        expect(SERVICE.id).not.toEqual("");
    });

    it("type", () => {
        expect(SERVICE.type).toEqual("http");
    });

    describe("get", () => {
        it("get success", (done) => {
            DISPATCH_SPY.mockImplementation(async (data: any): Promise<NetworkServiceResponseData> => {
                const { payload } = data as {
                    rest: RequestRestData;
                    payload: RequestPayloadData;
                };
                return {
                    statusCode: HTTP_STATUS_CODE.OK,
                    headers: {},
                    body: payload,
                };
            });

            const client = new HttpClient(`http://localhost:${SERVICE_PORT}/test?TEST=true`);
            client.get().then((value) => {
                const res = JSON.parse(value);
                expect(res.param["TEST"]).toEqual("true");
                expect(DISPATCH_SPY).toHaveBeenCalled();
                done();
            }, done.fail);
        }, 50000);

        it("get success - in string response", (done) => {
            DISPATCH_SPY.mockImplementation(async (data: any): Promise<NetworkServiceResponseData> => {
                return {
                    statusCode: HTTP_STATUS_CODE.OK,
                    headers: {},
                    body: "response",
                };
            });

            const client = new HttpClient(`http://localhost:${SERVICE_PORT}/test?TEST=true`);
            client.get().then((value) => {
                expect(value).toEqual("response");
                expect(DISPATCH_SPY).toHaveBeenCalled();
                done();
            }, done.fail);
        }, 50000);

        it("path not valid", (done) => {
            const client = new HttpClient(`http://localhost:${SERVICE_PORT}/test_not_valid?TEST=true`);
            client.get().then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error).toEqual(HTTP_STATUS_CODE.NOT_FOUND);
                    expect(DISPATCH_SPY).not.toHaveBeenCalled();
                    done();
                },
            );
        }, 50000);

        it("execution error", (done) => {
            DISPATCH_SPY.mockImplementation(() => Promise.reject());

            const client = new HttpClient(`http://localhost:${SERVICE_PORT}/test?TEST=true`);
            client.get().then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error).toEqual(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
                    expect(DISPATCH_SPY).toHaveBeenCalled();
                    done();
                },
            );
        }, 50000);

        it("service invalid", (done) => {
            TIANYU.fwk.contributor.unexportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
            TIANYU.fwk.contributor.unexportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);

            const client = new HttpClient(`http://localhost:${SERVICE_PORT}/test?TEST=true`);
            client.get().then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error).toEqual(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
                    done();
                },
            );
        }, 50000);
    });

    describe("post", () => {
        it("success", (done) => {
            DISPATCH_SPY.mockImplementation(async (data: any): Promise<NetworkServiceResponseData> => {
                const { payload } = data as {
                    rest: RequestRestData;
                    payload: RequestPayloadData;
                };
                return {
                    statusCode: HTTP_STATUS_CODE.OK,
                    headers: {},
                    body: payload,
                };
            });

            const client = new HttpClient(`http://localhost:${SERVICE_PORT}/test?TEST=true`);
            client.post({ data: "test-data" }).then((value) => {
                const res = JSON.parse(value);
                expect(res.param["TEST"]).toEqual("true");
                expect(DISPATCH_SPY).toHaveBeenCalled();
                done();
            }, done.fail);
        }, 50000);

        it("success - in string response", (done) => {
            DISPATCH_SPY.mockImplementation(async (data: any): Promise<NetworkServiceResponseData> => {
                return {
                    statusCode: HTTP_STATUS_CODE.OK,
                    headers: {},
                    body: "response",
                };
            });

            const client = new HttpClient(`http://localhost:${SERVICE_PORT}/test?TEST=true`);
            client.post({ data: "test-data" }).then((value) => {
                expect(value).toEqual("response");
                expect(DISPATCH_SPY).toHaveBeenCalled();
                done();
            }, done.fail);
        }, 50000);

        it("path not valid", (done) => {
            const client = new HttpClient(`http://localhost:${SERVICE_PORT}/test_not_valid?TEST=true`);
            client.post({ data: "test-data" }).then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error).toEqual(HTTP_STATUS_CODE.NOT_FOUND);
                    expect(DISPATCH_SPY).not.toHaveBeenCalled();
                    done();
                },
            );
        }, 50000);

        it("execution error", (done) => {
            DISPATCH_SPY.mockImplementation(() => Promise.reject());

            const client = new HttpClient(`http://localhost:${SERVICE_PORT}/test?TEST=true`);
            client.post({ data: "test-data" }).then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error).toEqual(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
                    expect(DISPATCH_SPY).toHaveBeenCalled();
                    done();
                },
            );
        }, 50000);

        it("service invalid", (done) => {
            TIANYU.fwk.contributor.unexportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
            TIANYU.fwk.contributor.unexportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);

            const client = new HttpClient(`http://localhost:${SERVICE_PORT}/test?TEST=true`);
            client.post({ data: "test-data" }).then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error).toEqual(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
                    done();
                },
            );
        }, 50000);
    });

    it("invalid method", (done) => {
        const client = new HttpClient(`http://localhost:${SERVICE_PORT}/test?TEST=true`);
        client.send("PUT", { data: "test-data" }).then(
            () => {
                done.fail();
            },
            (error) => {
                expect(error).toEqual(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED);
                expect(DISPATCH_SPY).not.toHaveBeenCalled();
                done();
            },
        );
    }, 50000);
});

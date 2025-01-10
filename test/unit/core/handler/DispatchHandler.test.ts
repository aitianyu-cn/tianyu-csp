/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { DispatchHandler } from "#core/handler/DispatchHandler";
import { createContributor } from "#core/InfraLoader";
import {
    DISPATCH_HANDLER_MODULE_ID,
    HTTP_STATUS_CODE,
    JobWorkerExecutionResult,
    PathEntry,
    RequestPayloadData,
} from "#interface";
import { AreaCode, guid } from "@aitianyu.cn/types";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.handler.DispatchHandler", () => {
    const contributor = createContributor();
    const REQ_JOB_POOL = guid();
    const SEC_JOB_POOL = guid();

    let DSP_HANDLER: any = null;

    beforeAll(() => {
        DSP_HANDLER = new DispatchHandler(undefined, contributor);

        DSP_HANDLER["_requestJobPool"] = REQ_JOB_POOL;
        DSP_HANDLER["_scheduleJobPool"] = SEC_JOB_POOL;
    });

    afterEach(() => {
        contributor.unregisterEndpoint("job-manager.dispatch");
    });

    describe("dispatch-handler.network-dispatcher", () => {
        const payload: {
            rest: PathEntry;
            payload: RequestPayloadData;
        } = {
            rest: {
                package: "",
                module: "",
                method: "",
            },
            payload: {
                url: "",
                serviceId: "",
                requestId: "",
                sessionId: "",
                type: "http",
                language: AreaCode.unknown,
                body: undefined,
                cookie: {},
                param: {},
                headers: {},
                disableCache: true,
            },
        };
        it("execute witch error", (done) => {
            const dispatcher = contributor.findModule("dispatch-handler.network-dispatcher", DISPATCH_HANDLER_MODULE_ID);
            expect(dispatcher).toBeDefined();
            if (!dispatcher) {
                return;
            }

            contributor.exportModule("job-manager.dispatch", REQ_JOB_POOL, function () {
                const result: JobWorkerExecutionResult = {
                    exitCode: 1000,
                    value: undefined,
                    error: [
                        {
                            code: SERVICE_ERROR_CODES.INTERNAL_ERROR,
                            message: "error",
                        },
                    ],
                    status: "error",
                };
                return Promise.resolve(result);
            });

            dispatcher(payload).then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error.status).toEqual("error");
                    expect(error.error.code).toEqual("1000");
                    done();
                },
            );
        });

        it("execute success - no content", (done) => {
            const dispatcher = contributor.findModule("dispatch-handler.network-dispatcher", DISPATCH_HANDLER_MODULE_ID);
            expect(dispatcher).toBeDefined();
            if (!dispatcher) {
                return;
            }

            contributor.exportModule("job-manager.dispatch", REQ_JOB_POOL, function () {
                const result: JobWorkerExecutionResult = {
                    exitCode: 0,
                    value: undefined,
                    error: [],
                    status: "done",
                };
                return Promise.resolve(result);
            });

            dispatcher(payload).then((value) => {
                expect(value.statusCode).toEqual(HTTP_STATUS_CODE.NO_CONTENT);
                done();
            }, done.fail);
        });

        it("execute success - ok", (done) => {
            const dispatcher = contributor.findModule("dispatch-handler.network-dispatcher", DISPATCH_HANDLER_MODULE_ID);
            expect(dispatcher).toBeDefined();
            if (!dispatcher) {
                return;
            }

            contributor.exportModule("job-manager.dispatch", REQ_JOB_POOL, function () {
                const result: JobWorkerExecutionResult = {
                    exitCode: 0,
                    value: { statusCode: 0 },
                    error: [],
                    status: "done",
                };
                return Promise.resolve(result);
            });

            dispatcher(payload).then((value) => {
                expect(value.statusCode).toEqual(HTTP_STATUS_CODE.OK);
                done();
            }, done.fail);
        });

        it("execute success - exit code", (done) => {
            const dispatcher = contributor.findModule("dispatch-handler.network-dispatcher", DISPATCH_HANDLER_MODULE_ID);
            expect(dispatcher).toBeDefined();
            if (!dispatcher) {
                return;
            }

            contributor.exportModule("job-manager.dispatch", REQ_JOB_POOL, function () {
                const result: JobWorkerExecutionResult = {
                    exitCode: 100,
                    value: undefined,
                    error: [],
                    status: "done",
                };
                return Promise.resolve(result);
            });

            dispatcher(payload).then((value) => {
                expect(value.statusCode).toEqual(100);
                done();
            }, done.fail);
        });

        it("execute success - status code", (done) => {
            const dispatcher = contributor.findModule("dispatch-handler.network-dispatcher", DISPATCH_HANDLER_MODULE_ID);
            expect(dispatcher).toBeDefined();
            if (!dispatcher) {
                return;
            }

            contributor.exportModule("job-manager.dispatch", REQ_JOB_POOL, function () {
                const result: JobWorkerExecutionResult = {
                    exitCode: 100,
                    value: { statusCode: 100 },
                    error: [],
                    status: "done",
                };
                return Promise.resolve(result);
            });

            dispatcher(payload).then((value) => {
                expect(value.statusCode).toEqual(100);
                done();
            }, done.fail);
        });
    });

    it("execute witch error", (done) => {
        const dispatcher = contributor.findModule("dispatch-handler.job-dispatcher", DISPATCH_HANDLER_MODULE_ID);
        expect(dispatcher).toBeDefined();
        if (!dispatcher) {
            return;
        }

        contributor.exportModule("job-manager.dispatch", SEC_JOB_POOL, function () {
            const result: JobWorkerExecutionResult = {
                exitCode: 1000,
                value: undefined,
                error: [
                    {
                        code: SERVICE_ERROR_CODES.INTERNAL_ERROR,
                        message: "error",
                    },
                ],
                status: "done",
            };
            return Promise.resolve(result);
        });

        dispatcher({} as any).then((value) => {
            expect(value.status).toEqual("done");
            expect(value.error[0].code).toEqual(SERVICE_ERROR_CODES.INTERNAL_ERROR);
            expect(value.error[0].message).toEqual("error");
            done();
        }, done.fail);
    });

    it("initialize", () => {
        const contributor = createContributor();
        const handler = new DispatchHandler(undefined, contributor);
        handler.initialize();

        expect(handler["_requestJobPool"]).not.toEqual("");
        expect(handler["_scheduleJobPool"]).not.toEqual("");

        expect(contributor.findModule("job-manager.dispatch", handler["_requestJobPool"])).toBeDefined();
        expect(contributor.findModule("job-manager.dispatch", handler["_scheduleJobPool"])).toBeDefined();
    });
});

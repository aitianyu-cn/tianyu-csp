/** @format */

import * as SESSION_HANDLER from "#core/infra/code/SessionCodes";
import { run_network_request } from "#core/script/NetworkRunnerImpl";
import { HTTP_STATUS_CODE, JobWorkerExecutionEntry, RequestPayloadData } from "#interface";
import { AreaCode } from "@aitianyu.cn/types";

const SESSION_ID = "session_id";
const USER_ID = "test_user";
const LICENSE_ID = "test_license";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.script.NetworkRunnerImpl", () => {
    beforeEach(() => {
        jest.spyOn(SESSION_HANDLER, "handleSession").mockReturnValue(Promise.resolve(USER_ID));
        jest.spyOn(SESSION_HANDLER, "handleSessionUser").mockReturnValue(
            Promise.resolve({ name: "Test User", license: LICENSE_ID }),
        );
        jest.spyOn(SESSION_HANDLER, "handleSessionIsAdminMode").mockReturnValue(Promise.resolve({ admin: true }));
        jest.spyOn(SESSION_HANDLER, "handleSessionPrivileges").mockReturnValue(
            Promise.resolve({
                p1: { read: true, write: true, delete: false, change: true, execute: true },
                p2: { read: true, write: true, delete: false, change: true, execute: true },
            }),
        );
    });

    it("success", (done) => {
        const payload: { payload: RequestPayloadData; script: JobWorkerExecutionEntry } = {
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
            },
            script: {
                package: "test",
                module: "JobExecutionObj",
                method: "success",
            },
        };

        const promise = new Promise<void>(async (resolve) => {
            const messagePort = {
                postMessage: (data: any) => {
                    expect(data.data.status).toEqual("success");
                },
            };
            jest.spyOn(process, "exit").mockImplementation((code?: string | number | null | undefined) => {
                expect(code).toEqual(HTTP_STATUS_CODE.OK);
                resolve();
                return {} as never;
            });

            run_network_request(payload, messagePort as any);
        });

        promise.then(done, done.fail);
    });

    it("failed", (done) => {
        const payload: { payload: RequestPayloadData; script: JobWorkerExecutionEntry } = {
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
            },
            script: {
                package: "test",
                module: "JobExecutionObj",
                method: "failed",
            },
        };

        const promise = new Promise<void>(async (resolve) => {
            const messagePort = {
                postMessage: (data: any) => {
                    expect(data.error.length).toEqual(1);
                    expect(data.error[0].error).toEqual("error");
                },
            };
            jest.spyOn(process, "exit").mockImplementation((code?: string | number | null | undefined) => {
                expect(code).toEqual(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
                resolve();
                return {} as never;
            });

            run_network_request(payload, messagePort as any);
        });

        promise.then(done, done.fail);
    });

    it("failed - no message", (done) => {
        const payload: { payload: RequestPayloadData; script: JobWorkerExecutionEntry } = {
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
            },
            script: {
                package: "test",
                module: "JobExecutionObj",
                method: "failedNoMessage",
            },
        };

        const promise = new Promise<void>(async (resolve) => {
            const messagePort = {
                postMessage: (data: any) => {
                    expect(data.error.length).toEqual(1);
                    expect(data.error[0].error).toEqual("Technical Error.");
                },
            };
            jest.spyOn(process, "exit").mockImplementation((code?: string | number | null | undefined) => {
                expect(code).toEqual(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
                resolve();
                return {} as never;
            });

            run_network_request(payload, messagePort as any);
        });

        promise.then(done, done.fail);
    });

    it("import wrong module", (done) => {
        const payload: { payload: RequestPayloadData; script: JobWorkerExecutionEntry } = {
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
            },
            script: {
                package: "test",
                module: "JobExecutionObj_not_exist",
                method: "failedNoMessage",
            },
        };

        const promise = new Promise<void>(async (resolve) => {
            const messagePort = {
                postMessage: (data: any) => {
                    expect(data.error.length).toEqual(1);
                },
            };
            jest.spyOn(process, "exit").mockImplementation((code?: string | number | null | undefined) => {
                expect(code).toEqual(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
                resolve();
                return {} as never;
            });

            run_network_request(payload, messagePort as any);
        });

        promise.then(done, done.fail);
    });
});

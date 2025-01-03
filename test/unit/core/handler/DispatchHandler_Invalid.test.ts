/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { DispatchHandler } from "#core/handler/DispatchHandler";
import { createContributor } from "#core/InfraLoader";
import { DISPATCH_HANDLER_MODULE_ID, HTTP_STATUS_CODE } from "#interface";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.handler.DispatchHandler_Invalid", () => {
    const contributor = createContributor();

    beforeAll(() => {
        new DispatchHandler(undefined, contributor);

        contributor.unregisterEndpoint("job-manager.dispatch");
    });

    it("dispatch-handler.network-dispatcher", (done) => {
        const dispatcher = contributor.findModule("dispatch-handler.network-dispatcher", DISPATCH_HANDLER_MODULE_ID);
        expect(dispatcher).toBeDefined();

        if (dispatcher) {
            dispatcher({} as any).then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error.status).toEqual("error");

                    expect(error.error.code).toEqual(HTTP_STATUS_CODE.SERVICE_UNAVAILABLE.toString());
                    expect(error.error.message).toEqual("error occurs when request processing.");
                    expect(error.error.error).toEqual(
                        "network request could not be handled internally due to some technical errors.",
                    );
                    done();
                },
            );
        }
    });

    it("dispatch-handler.job-dispatcher", (done) => {
        const dispatcher = contributor.findModule("dispatch-handler.job-dispatcher", DISPATCH_HANDLER_MODULE_ID);
        expect(dispatcher).toBeDefined();

        if (dispatcher) {
            dispatcher({} as any).then((result) => {
                expect(result.exitCode.toString()).toEqual(SERVICE_ERROR_CODES.INTERNAL_ERROR);
                expect(result.status).toEqual("error");

                expect(result.error[0].code).toEqual(SERVICE_ERROR_CODES.JOB_RUNNING_INITIAL_FAILED);
                expect(result.error[0].message).toEqual("error occurs when job processing.");
                expect(result.error[0].error).toEqual(
                    "job could not be handled internally due to some technical errors (JobManager is not valid).",
                );
                done();
            }, done.fail);
        }
    });
});

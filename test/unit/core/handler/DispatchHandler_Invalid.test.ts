/** @format */

import { MessageBundle } from "#base/res/InternalMessageBundle";
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
                    expect(error.error.message).toEqual(MessageBundle.text("ERROR_CORE_HANDLER_DISPATCH_PROCESS", "request"));
                    expect(error.error.error).toEqual(MessageBundle.text("ERROR_CORE_HANDLER_DISPATCH_REQUEST_PROCESS_DET"));
                    done();
                },
            );
        }
    });

    it("dispatch-handler.job-dispatcher", (done) => {
        const dispatcher = contributor.findModule("dispatch-handler.job-dispatcher", DISPATCH_HANDLER_MODULE_ID);
        expect(dispatcher).toBeDefined();

        if (dispatcher) {
            dispatcher({} as any).then(
                (result) => {
                    expect(result.exitCode.toString()).toEqual(SERVICE_ERROR_CODES.INTERNAL_ERROR);
                    expect(result.status).toEqual("error");

                    expect(result.error[0].code).toEqual(SERVICE_ERROR_CODES.JOB_RUNNING_INITIAL_FAILED);
                    expect(result.error[0].message).toEqual(MessageBundle.text("ERROR_CORE_HANDLER_DISPATCH_PROCESS", "job"));
                    expect(result.error[0].error).toEqual(MessageBundle.text("ERROR_CORE_HANDLER_DISPATCH_JOB_PROCESS_DET"));
                    done();
                },
                () => done.fail(),
            );
        }
    });
});

/** @format */

import { StringObj } from "#base/object/String";
import { MessageBundle } from "#base/res/InternalMessageBundle";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { GlobalRequestManager } from "#core/infra/RequestManager";
import { SessionManager } from "#core/infra/SessionManager";
import { generateInfra } from "#core/InfraLoader";
import {
    JobWorkerExecutionEntry,
    JobWorkerMessageValue,
    OperationError,
    ScheduleJobPayload,
    SchedultJobExecuteParam,
} from "#interface";
import { ErrorHelper } from "#utils";
import { MessagePort } from "worker_threads";

export async function run_job_scripts(workerData: any, parentPort: MessagePort | null): Promise<void> {
    const { payload, script } = workerData as { payload: ScheduleJobPayload; script: JobWorkerExecutionEntry };

    const requestMgr = new GlobalRequestManager();
    const sessionMgr = new SessionManager(payload);

    const infra = generateInfra(sessionMgr, requestMgr);
    (global as any).TIANYU = infra;

    infra.trace.setId(payload.req.traceId || "");

    const result: JobWorkerMessageValue = {
        data: undefined,
        error: [],
    };

    await sessionMgr.loadData().catch(
        /* istanbul ignore next */ (reason) => {
            TIANYU.environment.development &&
                void TIANYU.audit.error(
                    "job/runner/native",
                    MessageBundle.text("ERROR_CORE_SCRIPT_JOBRUNNER_LOADING_FAILED", payload.name, payload.id),
                    ErrorHelper.getError(
                        SERVICE_ERROR_CODES.INTERNAL_ERROR,
                        MessageBundle.text("ERROR_CORE_SCRIPT_JOBRUNNER_LOADING_FAILED", payload.name, payload.id),
                        (reason as any)?.message || MessageBundle.text("ERROR_GENERAL_ERROR"),
                    ),
                );
        },
    );

    try {
        const object = infra.import(script.package, script.module);
        try {
            const data: SchedultJobExecuteParam = {
                id: payload.id,
                name: payload.name,
                payload: payload.payload,
            };
            result.data = await object[script.method](data);
        } catch (e) {
            result.error.push(
                ErrorHelper.getError(
                    SERVICE_ERROR_CODES.INTERNAL_ERROR,
                    MessageBundle.text(
                        "ERROR_CORE_SCRIPT_JOBRUNNER_RUNTIME_FAILED",
                        payload.name,
                        StringObj.stringifySafe(payload.payload),
                    ),

                    (e as any)?.message || MessageBundle.text("ERROR_GENERAL_ERROR"),
                ),
            );
        }
    } catch (e) {
        /* istanbul ignore if */
        if (e instanceof Error) {
            result.error.push(
                ErrorHelper.getError(
                    SERVICE_ERROR_CODES.INTERNAL_ERROR,
                    MessageBundle.text(
                        "ERROR_CORE_SCRIPT_JOBRUNNER_RUNTIME_FAILED",
                        payload.name,
                        StringObj.stringifySafe(payload.payload),
                    ),
                    (e as any)?.message || MessageBundle.text("ERROR_GENERAL_ERROR"),
                ),
            );
        } else {
            result.error.push(e as OperationError);
        }
    }

    // return the result
    parentPort?.postMessage(result);

    await TIANYU.lifecycle.recycle();
    await TIANYU.audit.flush();

    process.exit(result.error.length ? SERVICE_ERROR_CODES.INTERNAL_ERROR : 0);
}

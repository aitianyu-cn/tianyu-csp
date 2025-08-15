/** @format */

import { StringObj } from "#base/object/String";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { GenericRequestManager } from "#core/infra/RequestManager";
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

    const requestMgr = new GenericRequestManager(payload.req);
    const sessionMgr = new SessionManager(requestMgr);

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
                    `execute job from ${payload.name} (${payload.id}) failed.`,
                    ErrorHelper.getError(
                        SERVICE_ERROR_CODES.INTERNAL_ERROR,
                        `execute job from ${payload.name} (${payload.id}) failed.`,
                        (reason as any)?.message || "Technical Error.",
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
                    `execute job '${payload.name}' failed with payload: ${StringObj.stringifySafe(payload.payload)}.`,
                    (e as any)?.message || "Technical Error.",
                ),
            );
        }
    } catch (e) {
        /* istanbul ignore if */
        if (e instanceof Error) {
            result.error.push(
                ErrorHelper.getError(
                    SERVICE_ERROR_CODES.INTERNAL_ERROR,
                    `execute job '${payload.name}' failed with payload: ${StringObj.stringifySafe(payload.payload)}.`,
                    (e as any)?.message || "Technical Error.",
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

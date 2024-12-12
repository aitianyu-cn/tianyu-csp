/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { GenericRequestManager } from "#core/infra/RequestManager";
import { SessionManager } from "#core/infra/SessionManager";
import { generateInfra } from "#core/InfraLoader";
import { JobWorkerExecutionEntry, JobWorkerMessageValue, OperationError, ScheduleJobPayload } from "#interface";
import { ErrorHelper } from "#utils/ErrorHelper";
import { workerData, parentPort } from "worker_threads";

async function run(): Promise<void> {
    const { payload, script } = workerData as { payload: ScheduleJobPayload; script: JobWorkerExecutionEntry };

    const requestMgr = new GenericRequestManager(payload.req);
    const sessionMgr = new SessionManager(requestMgr);

    const infra = generateInfra(sessionMgr, requestMgr);
    (global as any).TIANYU = infra;

    await sessionMgr.loadData();

    infra.trace.setId(payload.req.traceId || "");

    // to start a function call
    const result: JobWorkerMessageValue = {
        data: undefined,
        error: [],
    };
    try {
        const object = infra.import(script.package, script.module);
        try {
            result.data = await object[script.method]();
        } catch (e) {
            result.error.push(
                ErrorHelper.getError(
                    SERVICE_ERROR_CODES.INTERNAL_ERROR,
                    `execute job '${payload.name}' failed with payload: ${JSON.stringify(payload.payload)}.`,
                    (e as any)?.message || "Technical Error.",
                ),
            );
        }
    } catch (e) {
        if (e instanceof Error) {
            result.error.push(
                ErrorHelper.getError(
                    SERVICE_ERROR_CODES.INTERNAL_ERROR,
                    `execute job '${payload.name}' failed with payload: ${JSON.stringify(payload.payload)}.`,
                    (e as any)?.message || "Technical Error.",
                ),
            );
        } else {
            result.error.push(e as OperationError);
        }
    }

    // return the result
    parentPort?.postMessage(result);
    process.exit(result.error.length ? SERVICE_ERROR_CODES.INTERNAL_ERROR : 0);
}

run();

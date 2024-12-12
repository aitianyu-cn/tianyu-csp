/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { GenericRequestManager } from "#core/infra/RequestManager";
import { SessionManager } from "#core/infra/SessionManager";
import { generateInfra } from "#core/InfraLoader";
import { HTTP_STATUS_CODE, JobWorkerExecutionEntry, JobWorkerMessageValue, OperationError, RequestPayloadData } from "#interface";
import { ErrorHelper } from "#utils/ErrorHelper";
import { workerData, parentPort } from "worker_threads";

async function run(): Promise<void> {
    // prepare data and runtime
    const data: { payload: RequestPayloadData; script: JobWorkerExecutionEntry } = workerData;

    const requestMgr = new GenericRequestManager(data.payload);
    const sessionMgr = new SessionManager(requestMgr);

    const infra = generateInfra(sessionMgr, requestMgr);
    (global as any).TIANYU = infra;

    await sessionMgr.loadData();

    infra.trace.setId(data.payload.traceId || "");

    // to start a function call
    const result: JobWorkerMessageValue = {
        data: undefined,
        error: [],
    };
    try {
        const object = infra.import(data.script.package, data.script.module);
        try {
            result.data = await object[data.script.method]();
        } catch (e) {
            result.error.push(
                ErrorHelper.getError(
                    SERVICE_ERROR_CODES.INTERNAL_ERROR,
                    `execute request from ${data.payload.url} failed.`,
                    (e as any)?.message || "Technical Error.",
                ),
            );
        }
    } catch (e) {
        if (e instanceof Error) {
            result.error.push(
                ErrorHelper.getError(
                    SERVICE_ERROR_CODES.INTERNAL_ERROR,
                    `execute request from ${data.payload.url} failed.`,
                    (e as any)?.message || "Technical Error.",
                ),
            );
        } else {
            result.error.push(e as OperationError);
        }
    }

    // return the result
    parentPort?.postMessage(result);
    process.exit(result.error.length ? HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR : HTTP_STATUS_CODE.OK);
}

run();

/** @format */

import { INFRA_ERROR_CODES } from "#core/Constant";
import { ErrorHelper } from "#utils";
import { LogLevel, MapOfString } from "@aitianyu.cn/types";
import { SYSTEM_EXTERNAL_CALL } from "packages/Common";

/**
 * To execute an external system procedure
 *
 * @param data external system execution data
 * @param func function name of system functionality
 * @param method method name of system function
 * @param message error message template
 * @param [noerror=false] to not post error to logger manager (used for LoggerManager only to prevent function call loop)
 * @returns return the external call execution response, null value will be return if error occurs when running
 */
export async function doXcall(
    data: MapOfString,
    func: string,
    method: string,
    message: string,
    noerror: boolean = false,
): Promise<any> {
    const externalCall = SYSTEM_EXTERNAL_CALL[func]?.[method];
    if (!externalCall) {
        !noerror &&
            TIANYU.audit.error(
                `generic-xcall/${func}`,
                ErrorHelper.getErrorString(
                    INFRA_ERROR_CODES.EXTERNAL_SYSTEM_API_CALL_FAILED,
                    message,
                    `system external function '${func}.${method}' is not configurated`,
                ),
            );
        return null;
    }

    try {
        const xmodule = TIANYU.import(externalCall.package || "", externalCall.module || "");
        const xcall = externalCall.method ? xmodule?.[externalCall.method] : xmodule;
        if (typeof xcall === "function") {
            return (await xcall(data)) || null;
        } else {
            !noerror &&
                TIANYU.audit.error(
                    `generic-xcall/${func}`,
                    ErrorHelper.getErrorString(
                        INFRA_ERROR_CODES.EXTERNAL_SYSTEM_API_CALL_FAILED,
                        message,
                        `system external function '${externalCall.package}.${externalCall.module}.${externalCall.method}' could not to access.`,
                    ),
                );
            return null;
        }
    } catch (error) {
        !noerror &&
            TIANYU.audit.error(
                `generic-xcall/${func}`,
                ErrorHelper.getErrorString(
                    INFRA_ERROR_CODES.EXTERNAL_SYSTEM_API_CALL_FAILED,
                    message,
                    (error as any)?.message || "Technical error occurs.",
                ),
            );
        return null;
    }
}

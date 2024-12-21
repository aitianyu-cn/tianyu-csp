/** @format */

import { INFRA_ERROR_CODES } from "#core/Constant";
import { ErrorHelper } from "#utils/ErrorHelper";
import { MapOfString } from "@aitianyu.cn/types";
import { SYSTEM_EXTERNAL_CALL } from "packages/Common";

export async function doXcall(data: MapOfString, func: string, method: string, message: string): Promise<any> {
    const externalCall = SYSTEM_EXTERNAL_CALL[func]?.[method];
    if (!externalCall) {
        TIANYU.logger.error(
            ErrorHelper.getErrorString(
                INFRA_ERROR_CODES.EXTERNAL_SYSTEM_API_CALL_FAILED,
                message,
                `system external function '${func}.${method}' is not configurated`,
            ),
        );
        return null;
    }

    try {
        const xcall = TIANYU.import(externalCall.package || "", externalCall.module || "")?.[externalCall.method || ""];
        if (typeof xcall === "function") {
            return (await xcall(data)) || null;
        } else {
            TIANYU.logger.error(
                ErrorHelper.getErrorString(
                    INFRA_ERROR_CODES.EXTERNAL_SYSTEM_API_CALL_FAILED,
                    message,
                    `system external function '${externalCall.package}.${externalCall.module}.${externalCall.method}' could not to access.`,
                ),
            );
            return null;
        }
    } catch (error) {
        TIANYU.logger.error(
            ErrorHelper.getErrorString(
                INFRA_ERROR_CODES.EXTERNAL_SYSTEM_API_CALL_FAILED,
                message,
                (error as any)?.message || "Technical error occurs.",
            ),
        );
        return null;
    }
}

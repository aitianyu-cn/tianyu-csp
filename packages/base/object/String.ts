/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { ErrorHelper } from "#utils";

export class StringObj {
    public static stringify(data: any): string {
        const type = typeof data;
        if (type === "undefined") {
            return "undefined";
        }
        if (type === "function") {
            throw ErrorHelper.getError(SERVICE_ERROR_CODES.INTERNAL_ERROR, "Could not stringify a 'function' type object");
        }
        if (type === "string") {
            return data;
        }
        if (type === "bigint" || type === "number" || type === "symbol" || type === "boolean") {
            return data.toString();
        }
        return JSON.stringify(data);
    }

    public static stringifySafe(data: any): string {
        try {
            return StringObj.stringify(data);
        } catch (e) {
            void TIANYU.audit.error("base/object/StringObj", `could not safety stringify an object.`, String(e));
            return "";
        }
    }
}

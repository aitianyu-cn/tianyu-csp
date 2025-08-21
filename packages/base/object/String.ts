/** @format */

import { MessageBundle } from "#base/res/InternalMessageBundle";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { ErrorHelper } from "#utils";

/** String Object Type */
export class StringObj {
    /**
     * @deprecated
     *
     * convert an object to be a string.
     * This is an unsafe function to convert an object to be string. suggest to use stringifySafe to convert object to string.
     *
     * @param src source object
     * @returns target string
     */
    public static stringify(data: any): string {
        const type = typeof data;
        if (type === "undefined") {
            return "undefined";
        }
        if (type === "function") {
            throw ErrorHelper.getError(
                SERVICE_ERROR_CODES.INTERNAL_ERROR,
                MessageBundle.text("ERROR_BASE_OBJECT_STRING_OBJ_PARSE_FUNCTION"),
            );
        }
        if (type === "string") {
            return data;
        }
        if (type === "bigint" || type === "number" || type === "symbol" || type === "boolean") {
            return data.toString();
        }
        return JSON.stringify(data);
    }

    /**
     * convert an object to be a string safty. empty string will be return when error occurs in converting
     *
     * @param src source object
     * @returns target string
     */
    public static stringifySafe(data: any): string {
        try {
            return StringObj.stringify(data);
        } catch (e) {
            void TIANYU.audit.error(
                "base/object/StringObj",
                MessageBundle.text("ERROR_BASE_OBJECT_STRING_OBJ_PARSE_EXCEPTION"),
                String(e),
            );
            return "";
        }
    }
}

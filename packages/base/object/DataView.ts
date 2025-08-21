/** @format */

import { MessageBundle } from "#base/res/InternalMessageBundle";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { ErrorHelper } from "#utils";

/** DataView Object Type */
export class DataView {
    /**
     * Create a new node:DataView from given data buffer
     *
     * @param data source data buffer
     * @returns return node:DataView type equals to given data buffer
     */
    public static parse(data: ArrayBuffer | Int8Array | Uint8Array | Uint8ClampedArray): globalThis.DataView {
        if (data instanceof Int8Array || data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
            return new globalThis.DataView(data.buffer, data.byteOffset, data.byteLength);
        }

        if (data instanceof ArrayBuffer) {
            return new globalThis.DataView(data);
        }

        throw ErrorHelper.getError(
            SERVICE_ERROR_CODES.INTERNAL_ERROR,
            MessageBundle.text("ERROR_BASE_OBJECT_DATAVIEW_PARSE_TYPE_ERRORY"),
        );
    }
}

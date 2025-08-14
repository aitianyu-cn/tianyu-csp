/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { ErrorHelper } from "#utils";

export class DataView {
    public static parse(data: ArrayBuffer | Int8Array | Uint8Array | Uint8ClampedArray): globalThis.DataView {
        if (data instanceof Int8Array || data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
            return new globalThis.DataView(data.buffer, data.byteOffset, data.byteLength);
        }

        if (data instanceof ArrayBuffer) {
            return new globalThis.DataView(data);
        }

        throw ErrorHelper.getError(
            SERVICE_ERROR_CODES.INTERNAL_ERROR,
            "Expected `data` to be an ArrayBuffer, Buffer, Int8Array, Uint8Array or Uint8ClampedArray",
        );
    }
}

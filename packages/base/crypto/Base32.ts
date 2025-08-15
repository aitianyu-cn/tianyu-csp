/** @format */

import { Bytes } from "#base/object/Bytes";
import { DataView } from "#base/object/DataView";
import { Integer } from "#base/object/Integer";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { ErrorHelper } from "#utils";

/**
 * Base32 Encoding Type
 *
 * @field RFC3548
 * @field RFC4648
 * @field RFC4648-HEX
 * @field Crockford
 */
export type EncodingType = "RFC3548" | "RFC4648" | "RFC4648-HEX" | "Crockford";

/** Base32 Encoding Lib */
export class Base32 {
    private static RFC4648_CHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static RFC4648_HEX_CHS = "0123456789ABCDEFGHIJKLMNOPQRSTUV";
    private static CROCKFORD_CHS = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

    /**
     * To encode the buffer to be a Base32 encoded string
     *
     * @param data input source buffer
     * @param encoding encoding type
     * @returns return the encoded string
     */
    public static encode(data: ArrayBuffer | Int8Array | Uint8Array | Uint8ClampedArray, encoding: EncodingType): string {
        const alphabet = Base32.getAlphabet(encoding);
        const view = DataView.parse(data);

        let bits = 0;
        let value = 0;
        let output = "";

        for (let i = 0; i < view.byteLength; i++) {
            value = Integer.or(Integer.left(value, 8), view.getUint8(i));
            bits += 8;

            while (bits >= 5) {
                const index = Integer.and(Integer.rightUnsigned(value, bits - 5), 31);
                const char = alphabet[index];
                if (char === undefined) {
                    throw ErrorHelper.getError(
                        SERVICE_ERROR_CODES.INTERNAL_ERROR,
                        `Invalid index: ${index} in alphabet "${alphabet}"`,
                    );
                }
                output += char;
                bits -= 5;
            }
        }

        if (bits > 0) {
            output += alphabet[Integer.and(Integer.left(value, 5 - bits), 31)];
        }

        if (encoding !== "Crockford") {
            while (output.length % 8 !== 0) {
                output += "=";
            }
        }

        return output;
    }

    /**
     * Decode the input string to be an array buffer
     *
     * @param input source string
     * @param encoding encoding type
     * @returns return the target array buffer
     */
    public static decode(input: string, encoding: EncodingType): ArrayBuffer {
        const alphabet = Base32.getAlphabet(encoding);
        const data =
            encoding !== "Crockford" ? input.replace(/=+$/, "") : input.toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1");
        const length = data.length;

        let bits = 0;
        let value = 0;

        let index = 0;

        const output = new Uint8Array(Integer.or((length * 5) / 8, 0));

        for (let i = 0; i < length; i++) {
            value = Integer.or(Integer.left(value, 5), Base32.readChar(alphabet, data[i]));
            bits += 5;

            if (bits >= 8) {
                output[index++] = Integer.and(Integer.rightUnsigned(value, bits - 8), 255);
                bits -= 8;
            }
        }

        return output.buffer;
    }

    /**
     * Get a random string which is encoded by given encoding type
     *
     * @param size random bytes size
     * @param encoding encoding type
     * @returns return encoded random string
     */
    public static random(size: number, encoding: EncodingType = "RFC4648"): string {
        const bytes = Bytes.random(size);
        return Base32.encode(bytes, encoding);
    }

    private static getAlphabet(encoding: EncodingType): string {
        const alphabet =
            encoding === "RFC4648" || encoding === "RFC3548"
                ? Base32.RFC4648_CHS
                : encoding === "RFC4648-HEX"
                ? Base32.RFC4648_HEX_CHS
                : encoding === "Crockford"
                ? Base32.CROCKFORD_CHS
                : "";
        return alphabet;
    }

    private static readChar(alphabet: string, char: string): number {
        const idx = alphabet.indexOf(char);

        if (idx === -1) {
            throw ErrorHelper.getError(SERVICE_ERROR_CODES.INTERNAL_ERROR, `Invalid character found: ${char}`);
        }

        return idx;
    }
}

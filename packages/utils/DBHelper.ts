/** @format */

import { MapOfString, StringHelper } from "@aitianyu.cn/types";
import { DBConfigConverter } from "./db/DBConfigConverter";

const replaceMap: MapOfString = {
    '"': "{d_q}",
    "'": "{s_q}",
    "`": "{b_q}",
    ";": "{sem}",
};

const REPLACE_MAP_PAIR = Object.entries(replaceMap);

const ENCODE_REGEX = new RegExp(Object.keys(replaceMap).join("|"), "g");
const DECODE_REGEX = new RegExp(Object.values(replaceMap).join("|"), "g");

/**
 * @public
 *
 * Tianyu CSP helper of database
 */
export class DBHelper {
    /**
     * To encode a source string to remove database used symbol to avoid sql error
     *
     * @param src source string
     * @returns return formatted string
     */
    public static encode(src: string): string {
        if (!src) {
            return "";
        }

        const target = src.replace(ENCODE_REGEX, (match) => {
            return replaceMap[match] || /* istanbul ignore next */ "";
        });

        return target;
    }

    /**
     * To decode a string which is encoded by DBHelper to resume encoded symbols
     *
     * @param src encoded string
     * @returns return a decode string
     */
    public static decode(src: string): string {
        if (!src) {
            return "";
        }

        const target = src.replace(DECODE_REGEX, (match) => {
            return REPLACE_MAP_PAIR.find((value) => value[1] === match)?.[0] || /* istanbul ignore next */ "";
        });

        return target;
    }

    /**
     * To generate a sql string from giving source template and arguments.
     * The arguments will be encoded by DBHelper first and to generate target
     * sql string from encoded arguments
     *
     * @param src sql template
     * @param args arguments to fill sql template
     * @returns return a formatted and encoded sql string
     */
    public static format(src: string, args: (string | number)[]): string {
        const processedArgs: (string | number)[] = args.map((value) =>
            typeof value === "string" ? DBHelper.encode(value) : value,
        );
        return StringHelper.format(src, processedArgs);
    }

    /** Database configuration converter */
    public static converter = DBConfigConverter;
}

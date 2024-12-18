/** @format */

import { StringHelper } from "@aitianyu.cn/types";
import { DBConfigConverter } from "./db/DBConfigConverter";
import { RedisHelper } from "./db/Redis";

const replaceMap: any = {
    '"': "{d_q}",
    "'": "{s_q}",
    "`": "{b_q}",
    ";": "{sem}",
};

const REPLACE_MAP_PAIR = Object.entries(replaceMap);

const ENCODE_REGEX = new RegExp(Object.keys(replaceMap).join("|"), "g");
const DECODE_REGEX = new RegExp(Object.values(replaceMap).join("|"), "g");

export class DBHelper {
    public static encode(src: string): string {
        if (!src) {
            return "";
        }

        const target = src.replace(ENCODE_REGEX, (match) => {
            return replaceMap[match] || /* istanbul ignore next */ "";
        });

        return target;
    }

    public static decode(src: string): string {
        if (!src) {
            return "";
        }

        const target = src.replace(DECODE_REGEX, (match) => {
            return REPLACE_MAP_PAIR.find((value) => value[1] === match)?.[0] || /* istanbul ignore next */ "";
        });

        return target;
    }

    public static format(src: string, args: (string | number)[]): string {
        const processedArgs: (string | number)[] = args.map((value) =>
            typeof value === "string" ? DBHelper.encode(value) : value,
        );
        return StringHelper.format(src, processedArgs);
    }

    public static converter = DBConfigConverter;
    public static redis = RedisHelper;
}

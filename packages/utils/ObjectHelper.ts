/** @format */

import { MapOfString } from "@aitianyu.cn/types";

export class ObjectHelper {
    public static parse<T extends MapOfString>(src: string): T | null {
        try {
            const raw = JSON.parse(src);
            return raw;
        } catch {
            return null;
        }
    }
    public static stringify(obj: any): string {
        if (!Object.keys(obj).length) {
            return "";
        }

        try {
            const result = JSON.stringify(obj);
            return result;
        } catch {
            return "";
        }
    }
}

/** @format */

import { guid } from "@aitianyu.cn/types";

export class TraceHelper {
    public static generateTraceId(): string {
        return guid();
    }

    public static generateTime(time?: number | Date): string {
        const date = new Date(time || Date.now());
        const millisecondString = date.getMilliseconds().toString();
        const timeString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${millisecondString.substring(
            0,
            millisecondString.length > 3 ? 3 : millisecondString.length,
        )}`;
        return timeString;
    }
}

/** @format */

import { guid } from "@aitianyu.cn/types";

export class TraceHelper {
    public static generateTraceId(): string {
        return guid();
    }

    public static generateTime(time?: number | Date): string {
        const date = new Date(time || Date.now());
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hour = date.getHours().toString().padStart(2, "0");
        const minute = date.getMinutes().toString().padStart(2, "0");
        const second = date.getSeconds().toString().padStart(2, "0");
        const millisecondString = date.getMilliseconds().toString().padStart(3, "0");
        const timeString = `${date.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}.${millisecondString}`;
        return timeString;
    }
}

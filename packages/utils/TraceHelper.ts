/** @format */

import { guid } from "@aitianyu.cn/types";

/**
 * @public
 *
 * Tianyu CSP Helper for trace
 */
export class TraceHelper {
    /**
     * To generate a new trace id
     *
     * @returns return a new trace id as string
     */
    public static generateTraceId(): string {
        return guid();
    }

    /**
     * To generate a formatted time string like: "2025-01-02 03:40:40.345"
     *
     * @param time time for formatting, and current time will be assigned if no time provides
     * @returns return the time string
     */
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

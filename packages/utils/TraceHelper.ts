/** @format */

import { guid } from "@aitianyu.cn/types";

export class TraceHelper {
    public static generateTraceId(): string {
        return guid();
    }
}

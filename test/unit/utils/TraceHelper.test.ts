/** @format */

import { TraceHelper } from "#utils/TraceHelper";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.TraceHelper", () => {
    describe("generateTraceId", () => {
        it("-", () => {
            expect(TraceHelper.generateTraceId()).not.toEqual("");
        });
    });

    describe("generateTime", () => {
        it("-", () => {
            expect(TraceHelper.generateTime(0)).not.toEqual("");
            expect(TraceHelper.generateTime(new Date("2024-3-14 12:36:47.23456"))).not.toEqual("2024-3-14 12:36:47.234");
        });
    });
});

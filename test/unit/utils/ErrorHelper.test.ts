/** @format */

import { ErrorHelper } from "#utils/ErrorHelper";
import { guid } from "@aitianyu.cn/types";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.ErrorHelper", () => {
    afterEach(() => {
        TIANYU.trace.setId("");
    });

    describe("getError", () => {
        it("no trace id", () => {
            const error = ErrorHelper.getError("10000", "this is a test string", "error details");

            expect(error.code).toEqual("10000");
            expect(error.message).toEqual("this is a test string");
            expect(error.error).toEqual("error details");
            expect(error.traceId).toEqual(undefined);
        });

        it("has trace id", () => {
            const traceId = guid();
            TIANYU.trace.setId(traceId);

            const error = ErrorHelper.getError("10000", "this is a test string", "error details");

            expect(error.code).toEqual("10000");
            expect(error.message).toEqual("this is a test string");
            expect(error.error).toEqual("error details");
            expect(error.traceId).toEqual(traceId);
        });
    });
});

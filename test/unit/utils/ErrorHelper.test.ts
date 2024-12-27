/** @format */

import { HTTP_STATUS_CODE } from "#interface";
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

    describe("getErrorString", () => {
        it("no trace id", () => {
            const error = JSON.parse(ErrorHelper.getErrorString("10000", "this is a test string", "error details"));

            expect(error.code).toEqual("10000");
            expect(error.message).toEqual("this is a test string");
            expect(error.error).toEqual("error details");
            expect(error.traceId).toEqual(undefined);
        });

        it("has trace id", () => {
            const traceId = guid();
            TIANYU.trace.setId(traceId);

            const error = JSON.parse(ErrorHelper.getErrorString("10000", "this is a test string", "error details"));

            expect(error.code).toEqual("10000");
            expect(error.message).toEqual("this is a test string");
            expect(error.error).toEqual("error details");
            expect(error.traceId).toEqual(traceId);
        });
    });

    it("getHttpStatusByJobStatus", () => {
        expect(ErrorHelper.getHttpStatusByJobStatus("active")).toEqual(HTTP_STATUS_CODE.NO_CONTENT);
        expect(ErrorHelper.getHttpStatusByJobStatus("invalid")).toEqual(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
        expect(ErrorHelper.getHttpStatusByJobStatus("running")).toEqual(HTTP_STATUS_CODE.PROCESSING);
        expect(ErrorHelper.getHttpStatusByJobStatus("done")).toEqual(HTTP_STATUS_CODE.OK);
        expect(ErrorHelper.getHttpStatusByJobStatus("error")).toEqual(HTTP_STATUS_CODE.FORBIDDEN);
        expect(ErrorHelper.getHttpStatusByJobStatus("timeout")).toEqual(HTTP_STATUS_CODE.REQUEST_TIMEOUT);
        expect(ErrorHelper.getHttpStatusByJobStatus("ooo" as any)).toEqual(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    });
});

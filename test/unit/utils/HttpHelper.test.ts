/** @format */

import { HttpHelper } from "#utils";
import { AreaCode, MapOfString, parseAreaCode } from "@aitianyu.cn/types";
import { IncomingHttpHeaders } from "http";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.HttpHelper", () => {
    describe("processParameters", () => {
        it("no url provided and get empty param", () => {
            const param = HttpHelper.processParameters("");

            expect(Object.keys(param).length).toEqual(0);
        });

        it("has url with params", () => {
            const url = "?A=1&B=2&C=3";

            const param = HttpHelper.processParameters(url);

            expect(Object.keys(param).length).toEqual(3);
            expect(param["A"]).toEqual("1");
            expect(param["B"]).toEqual("2");
            expect(param["C"]).toEqual("3");
        });
    });

    describe("processCookie", () => {
        it("-", () => {
            const cookieSrc = "A=1 ; B= 2;C=3";

            const cookie = HttpHelper.processCookie(cookieSrc);

            expect(Object.keys(cookie).length).toEqual(3);
            expect(cookie["A"]).toEqual("1");
            expect(cookie["B"]).toEqual("2");
            expect(cookie["C"]).toEqual("3");
        });
    });

    describe("processHeader", () => {
        it("-", () => {
            const incomeHeader: IncomingHttpHeaders = {
                A: "1",
                B: ["1", "2", "3"],
            };

            const header = HttpHelper.processHeader(incomeHeader);

            expect(Object.keys(header).length).toEqual(2);
            expect(header["A"]).toEqual("1");
            expect(header["B"]).toEqual("1%%%2%%%3");
        });
    });

    describe("processLanguage", () => {
        const COOKIE: MapOfString = {
            LANGUAGE: "zh_CN",
            LANGUAGE_CUSTOM: "en_US",
            LANGUAGE_INVALID: "aaa",
        };

        const PARAMS: MapOfString = {
            language: parseAreaCode(AreaCode.af_ZA),
            language_custom: parseAreaCode(AreaCode.ar_AE),
            language_invalid: "bbb",
        };

        const HEADERS: IncomingHttpHeaders = {
            "accept-language": "zh-CN, zh, cn; en-US, en, US",
        };

        it("get from params", () => {
            expect(HttpHelper.processLanguage({}, PARAMS, {})).toEqual(AreaCode.af_ZA);
            expect(HttpHelper.processLanguage({}, PARAMS, {}, "", "language_custom")).toEqual(AreaCode.ar_AE);
            expect(HttpHelper.processLanguage({}, PARAMS, {}, "", "language_invalid")).toEqual(AreaCode.unknown);
        });

        it("get from cookie", () => {
            expect(HttpHelper.processLanguage(COOKIE, {}, {})).toEqual(AreaCode.zh_CN);
            expect(HttpHelper.processLanguage(COOKIE, {}, {}, "LANGUAGE_CUSTOM", "")).toEqual(AreaCode.en_US);
            expect(HttpHelper.processLanguage(COOKIE, {}, {}, "LANGUAGE_INVALID", "")).toEqual(AreaCode.unknown);
        });

        it("get from header", () => {
            expect(HttpHelper.processLanguage({}, {}, HEADERS)).toEqual(AreaCode.zh_CN);
        });

        it("no language provides", () => {
            expect(HttpHelper.processLanguage({}, {}, {})).toEqual(AreaCode.unknown);
        });
    });
});

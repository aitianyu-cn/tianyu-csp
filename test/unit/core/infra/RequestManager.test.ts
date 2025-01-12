/** @format */

import { GenericRequestManager, GlobalRequestManager } from "#core/infra/RequestManager";
import { HTTP_STATUS_CODE, RequestPayloadData } from "#interface";
import { AreaCode } from "@aitianyu.cn/types";
import { PROJECT_DEFAULT_LANGUAGE, PROJECT_NAME, PROJECT_VERSION } from "packages/Common";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.RequestManager", () => {
    it("GlobalRequestManager", () => {
        const reqest = new GlobalRequestManager();

        expect(reqest.id).toEqual(PROJECT_NAME);
        expect(reqest.version).toEqual(PROJECT_VERSION);
        expect(reqest.host).toEqual("");
        expect(reqest.url).toEqual("/");
        expect(reqest.type).toEqual("http");
        expect(reqest.language).toEqual(PROJECT_DEFAULT_LANGUAGE);
        expect(reqest.session).toEqual("");
        expect(reqest.body).toBeNull();

        expect(() => {
            reqest.setResponseCode(0);
        }).not.toThrow();
        expect(reqest.getResponseCode()).toEqual(HTTP_STATUS_CODE.OK);

        expect(reqest.cookie("")).toEqual("");
        expect(reqest.header("")).toEqual("");
        expect(reqest.params("")).toEqual("");
    });

    it("GenericRequestManager", () => {
        const req: RequestPayloadData = {
            host: "localhost",
            url: "/a/b/c",
            serviceId: "222222",
            requestId: "111111",
            sessionId: "123456789",
            type: "http",
            language: AreaCode.zh_CN,
            body: {
                data: "test",
            },
            cookie: {
                LANGUAGE: "en_US",
            },
            param: {
                PAR1: "test",
            },
            headers: {
                host: "localhost",
                version: "1.1",
            },
            disableCache: true,
            version: "http2",
        };
        const request = new GenericRequestManager(req);

        expect(request.id).toEqual("111111");
        expect(request.version).toEqual("2.0");
        expect(request.host).toEqual("localhost");
        expect(request.url).toEqual("/a/b/c");
        expect(request.type).toEqual("http");
        expect(request.language).toEqual(AreaCode.zh_CN);
        expect(request.session).toEqual("123456789");
        expect(request.body).toEqual(req.body);

        expect(() => {
            request.setResponseCode(HTTP_STATUS_CODE.CONTINUE);
        }).not.toThrow();
        expect(request.getResponseCode()).toEqual(HTTP_STATUS_CODE.CONTINUE);

        expect(request.cookie("LANGUAGE")).toEqual("en_US");
        expect(request.header("host")).toEqual("localhost");
        expect(request.params("PAR1")).toEqual("test");

        expect(request.cookie("UNKNOWN")).toEqual("");
        expect(request.header("UNKNOWN")).toEqual("");
        expect(request.params("UNKNOWN")).toEqual("");
    });
});

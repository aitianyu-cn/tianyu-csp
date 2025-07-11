/** @format */

import { GenericRequestManager, GlobalRequestManager } from "#core/infra/RequestManager";
import { HTTP_STATUS_CODE, RequestPayloadData } from "#interface";
import { AreaCode } from "@aitianyu.cn/types";
import { PROJECT_DEFAULT_LANGUAGE, PROJECT_NAME, PROJECT_VERSION } from "packages/Common";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.RequestManager", () => {
    it("GlobalRequestManager", () => {
        const request = new GlobalRequestManager();

        expect(request.id).toEqual(PROJECT_NAME);
        expect(request.version).toEqual(PROJECT_VERSION);
        expect(request.host).toEqual("");
        expect(request.url).toEqual("/");
        expect(request.type).toEqual("http");
        expect(request.language).toEqual(PROJECT_DEFAULT_LANGUAGE);
        expect(request.session).toEqual("");
        expect(request.body).toBeNull();
        expect(request.protocol).toEqual("http2");

        expect(() => {
            request.setResponseCode(0);
        }).not.toThrow();
        expect(request.getResponseCode()).toEqual(HTTP_STATUS_CODE.OK);

        expect(request.cookie("")).toEqual("");
        expect(request.header("")).toEqual("");
        expect(request.params("")).toEqual("");

        expect(request.allHeaders()).toEqual({});
        expect(request.allParams()).toEqual({});
    });

    it("GenericRequestManager", () => {
        const req: RequestPayloadData = {
            host: "localhost",
            url: "/a/b/c",
            method: "GET",
            serviceId: "222222",
            requestId: "111111",
            sessionId: "123456789",
            type: "http",
            language: AreaCode.zh_CN,
            body: { data: "test" },
            cookie: { LANGUAGE: "en_US" },
            param: { PAR1: ["test"] },
            headers: { host: "localhost", version: "1.1" },
            disableCache: true,
            protocol: "http2",
        };
        const request = new GenericRequestManager(req);

        expect(request.id).toEqual("111111");
        expect(request.version).toEqual(PROJECT_VERSION);
        expect(request.host).toEqual("localhost");
        expect(request.url).toEqual("/a/b/c");
        expect(request.type).toEqual("http");
        expect(request.language).toEqual(AreaCode.zh_CN);
        expect(request.session).toEqual("123456789");
        expect(request.body).toEqual(req.body);
        expect(request.protocol).toEqual("http2");

        expect(() => {
            request.setResponseCode(HTTP_STATUS_CODE.CONTINUE);
        }).not.toThrow();
        expect(request.getResponseCode()).toEqual(HTTP_STATUS_CODE.CONTINUE);

        expect(request.cookie("LANGUAGE")).toEqual("en_US");
        expect(request.header("host")).toEqual("localhost");
        expect(request.params("PAR1")).toEqual(["test"]);

        expect(request.cookie("UNKNOWN")).toEqual("");
        expect(request.header("UNKNOWN")).toEqual("");
        expect(request.params("UNKNOWN")).toEqual("");

        expect(request.allHeaders()).toEqual({ host: "localhost", version: "1.1" });
        expect(request.allParams()).toEqual({ PAR1: ["test"] });
    });
});

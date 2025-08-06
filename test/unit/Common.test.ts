/** @format */

import { REST, REST_REQUEST_ITEM_MAP } from "#core/handler/RestHandlerConstant";
import { AreaCode } from "@aitianyu.cn/types";
import {
    EXTERNAL_MODULE_ROOT_PATH,
    INTERNAL_PROJECT_ROOT,
    LOADER_IGNORE_PATTERN,
    MIME_FILE_BINARY_LIST,
    MIME_FILE_CONTENT_MAP,
    MIME_FILE_TYPE_MAP,
    PROJECT_DEFAULT_LANGUAGE,
    PROJECT_ENVIRONMENT_MODE,
    PROJECT_NAME,
    PROJECT_ROOT_PATH,
    PROJECT_VERSION,
    SYSTEM_EXTERNAL_CALL,
    SYSTEM_PRIVILEGE_MAP,
} from "packages/Common";
import path from "path";

describe("aitianyu-cn.node-module.tianyu-csp.unit.Common", () => {
    const CONFIG = require(path.resolve(process.cwd(), "csp.config"));
    const PRIVILEGE = require(path.resolve(process.cwd(), ".config/privilege.json"));

    it("global defines test", () => {
        expect(INTERNAL_PROJECT_ROOT).toEqual(path.resolve(process.cwd(), "packages"));
        expect(PROJECT_ROOT_PATH).toEqual(process.cwd());

        expect(EXTERNAL_MODULE_ROOT_PATH).toEqual(path.resolve(PROJECT_ROOT_PATH, "scripts"));

        expect(PROJECT_VERSION).toEqual("1.0.0");
        expect(PROJECT_ENVIRONMENT_MODE).toEqual("development");
        expect(PROJECT_NAME).toEqual("CSP-Test-App");
        expect(PROJECT_DEFAULT_LANGUAGE).toEqual(AreaCode.zh_CN);

        const custom_rest = require(path.resolve(process.cwd(), CONFIG.rest.file));
        const rest = { ...custom_rest };
        expect(REST).toEqual(rest);

        const custom_request_map = CONFIG.rest["request-map"];
        expect(REST_REQUEST_ITEM_MAP).toEqual(custom_request_map);

        expect(Object.keys(SYSTEM_EXTERNAL_CALL).length).toEqual(9);
        expect(SYSTEM_PRIVILEGE_MAP).toEqual(PRIVILEGE);

        expect(MIME_FILE_TYPE_MAP["txt"]).toEqual("text");
        expect(MIME_FILE_CONTENT_MAP["txt"]).toEqual("text");

        expect(MIME_FILE_TYPE_MAP["hex"]).toEqual("hex");
        expect(MIME_FILE_CONTENT_MAP["hex"]).toEqual("text");

        expect(MIME_FILE_BINARY_LIST.includes("txt")).toBeFalsy();
        expect(MIME_FILE_BINARY_LIST.includes("hex")).toBeTruthy();

        expect(LOADER_IGNORE_PATTERN.test("/welcome/ignore/a")).toBeTruthy();
        expect(LOADER_IGNORE_PATTERN.test("/welcome/ig2/a.json")).toBeTruthy();
        expect(LOADER_IGNORE_PATTERN.test("/remote-proxy/test/ignore")).toBeTruthy();

        expect(LOADER_IGNORE_PATTERN.test("/welcome/ig2/b.json")).toBeFalsy();
    });
});

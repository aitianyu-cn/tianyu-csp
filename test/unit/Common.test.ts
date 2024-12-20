/** @format */

import { AreaCode } from "@aitianyu.cn/types";
import {
    DATABASE_CONFIGS_MAP,
    DATABASE_SYS_DB_MAP,
    DATABASE_TYPES_MAP,
    EXTERNAL_MODULE_ROOT_PATH,
    INTERNAL_PROJECT_ROOT,
    PROJECT_DEFAULT_LANGUAGE,
    PROJECT_ENVIRONMENT_MODE,
    PROJECT_NAME,
    PROJECT_ROOT_PATH,
    PROJECT_VERSION,
    REST,
    REST_REQUEST_ITEM_MAP,
    SESSION_LIFE_TIME,
    USER_LOGIN_LIFE_TIME,
} from "packages/Common";
import path from "path";

describe("aitianyu-cn.node-module.tianyu-csp.unit.Common", () => {
    const CONFIG = require(path.resolve(process.cwd(), "csp.config.json"));
    const DB_CONFIG = require(path.resolve(process.cwd(), ".config/db.js"));

    it("global defines test", () => {
        expect(INTERNAL_PROJECT_ROOT).toEqual(path.resolve(process.cwd(), "packages"));
        expect(PROJECT_ROOT_PATH).toEqual(process.cwd());

        expect(EXTERNAL_MODULE_ROOT_PATH).toEqual(path.resolve(PROJECT_ROOT_PATH, "scripts"));

        expect(PROJECT_VERSION).toEqual("1.0.0");
        expect(PROJECT_ENVIRONMENT_MODE).toEqual("development");
        expect(PROJECT_NAME).toEqual("CSP-Test-App");
        expect(PROJECT_DEFAULT_LANGUAGE).toEqual(AreaCode.zh_CN);

        const custom_rest = require(path.resolve(process.cwd(), ".config/rest.json"));
        const rest = { ...custom_rest };
        expect(REST).toEqual(rest);

        const custom_request_map = CONFIG.rest["request-map"];
        expect(REST_REQUEST_ITEM_MAP).toEqual(custom_request_map);

        expect(DATABASE_TYPES_MAP).toEqual(DB_CONFIG.DatabaseTypesMap);
        expect(DATABASE_CONFIGS_MAP).toEqual(DB_CONFIG.DatabaseConfigMap);
        expect(DATABASE_SYS_DB_MAP).toEqual(DB_CONFIG.SystemDBMap);

        expect(SESSION_LIFE_TIME).toEqual(30);
        expect(USER_LOGIN_LIFE_TIME).toEqual(10);
    });
});

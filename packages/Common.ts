/** @format */

import fs from "fs";
import path from "path";
import { guid, parseAreaString } from "@aitianyu.cn/types";
import { TianyuCSPConfig, TianyuCSPPrivilegeMap } from "#interface";

export const INTERNAL_PROJECT_ROOT: string = __dirname;
export const PROJECT_ROOT_PATH: string = process.cwd();

const DEFAULT_CSP_CONFIG_NAME: string = "csp.config";
const DEFAULT_EXTERNAL_MODULE_PATH: string = "src";

const config_file_path = path.resolve(PROJECT_ROOT_PATH, DEFAULT_CSP_CONFIG_NAME);
let raw_config: TianyuCSPConfig | null = null;
if (fs.existsSync(`${config_file_path}.json`) || fs.existsSync(`${config_file_path}.js`)) {
    try {
        raw_config = require(config_file_path);
    } catch {
        /* istanbul ignore next */ raw_config = null;
    }
}

export const PROJECT_ROOT_RELATION_PATH = raw_config?.config?.src || /* istanbul ignore next */ DEFAULT_EXTERNAL_MODULE_PATH;

export const EXTERNAL_MODULE_ROOT_PATH: string = path.resolve(PROJECT_ROOT_PATH, PROJECT_ROOT_RELATION_PATH);

export const PROJECT_VERSION = raw_config?.config?.version || /* istanbul ignore next */ "1.0.0";
export const PROJECT_ENVIRONMENT_MODE = raw_config?.config?.environment || /* istanbul ignore next */ "development";
export const PROJECT_NAME = raw_config?.config?.name || /* istanbul ignore next */ guid();
export const PROJECT_DEFAULT_LANGUAGE = parseAreaString(raw_config?.config?.language, true);

export const REST_CONFIG = raw_config?.rest;

export const SYSTEM_EXTERNAL_CALL = raw_config?.xcall || {};

const privilege_map_path = path.resolve(PROJECT_ROOT_PATH, raw_config?.config?.roles || "");
let raw_privileges = {};
if (fs.existsSync(privilege_map_path)) {
    try {
        raw_privileges = require(privilege_map_path);
    } catch {
        /* istanbul ignore next */ raw_privileges = {};
    }
}

export const SYSTEM_PRIVILEGE_MAP: TianyuCSPPrivilegeMap = raw_privileges;

export const SESSION_LIFE_TIME = raw_config?.user?.session_life || /* istanbul ignore next */ 30;
export const USER_LOGIN_LIFE_TIME = raw_config?.user?.login || /* istanbul ignore next */ 10;

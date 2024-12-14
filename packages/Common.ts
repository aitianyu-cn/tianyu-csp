/** @format */

import path from "path";
import fs from "fs";
import { AreaCode, guid, parseAreaString } from "@aitianyu.cn/types";

export const INTERNAL_PROJECT_ROOT: string = __dirname;
export const PROJECT_ROOT_PATH: string = process.cwd();

const DEFAULT_CSP_CONFIG_NAME = "csp.config.json";
const DEFAULT_EXTERNAL_MODULE_PATH = "src";
const DEFAULT_REST_CONFIG_NAME = "rest.config.json";
const DEFAULT_DB_CONFIG_NAME = "db.config.js";

const DEFAULT_DB_CONFIG_TYPES_ID = "databaseTypes";
const DEFAULT_DB_CONFIG_CONFIG_ID = "databaseConfigs";
const DEFAULT_DB_CONFIG_DBMAP_ID = "SystemDatabaseMap";

const config_file_path = path.resolve(PROJECT_ROOT_PATH, DEFAULT_CSP_CONFIG_NAME);
let raw_config = null;
if (fs.existsSync(config_file_path)) {
    try {
        raw_config = JSON.parse(fs.readFileSync(config_file_path, "utf-8"));
    } catch {
        /* istanbul ignore next */ raw_config = null;
    }
}

export const EXTERNAL_MODULE_ROOT_PATH: string = path.resolve(
    PROJECT_ROOT_PATH,
    raw_config?.config?.src || /* istanbul ignore next */ DEFAULT_EXTERNAL_MODULE_PATH,
);

export const PROJECT_VERSION: string = raw_config?.config?.version || /* istanbul ignore next */ "1.0.0";
export const PROJECT_ENVIRONMENT_MODE: string = raw_config?.config?.environment || /* istanbul ignore next */ "development";
export const PROJECT_NAME: string = raw_config?.config?.name || /* istanbul ignore next */ guid();
export const PROJECT_DEFAULT_LANGUAGE: AreaCode = parseAreaString(raw_config?.config?.language, true);

const rest_file_path = path.resolve(
    PROJECT_ROOT_PATH,
    raw_config?.rest?.file || /* istanbul ignore next */ DEFAULT_REST_CONFIG_NAME,
);
let raw_rest: any = {};
if (fs.existsSync(rest_file_path)) {
    try {
        raw_rest = JSON.parse(fs.readFileSync(rest_file_path, "utf-8"));
    } catch {
        /* istanbul ignore next */ raw_rest = {};
    }
}

export const REST = {
    ...raw_rest,

    // this is the default resets
};
export const REST_REQUEST_ITEM_MAP = raw_config?.rest?.["request-map"] || /* istanbul ignore next */ {};
export const REST_LOADER_RES_PATH = raw_config?.rest?.["loader"]
    ? path.resolve(EXTERNAL_MODULE_ROOT_PATH, raw_config?.rest?.["loader"])
    : /* istanbul ignore next */ EXTERNAL_MODULE_ROOT_PATH;

const dbconfig_file_path = path.resolve(
    PROJECT_ROOT_PATH,
    raw_config?.database?.file || /* istanbul ignore next */ DEFAULT_DB_CONFIG_NAME,
);
const dbconfig_types_id = raw_config?.database?.rename?.["types"] || /* istanbul ignore next */ DEFAULT_DB_CONFIG_TYPES_ID;
const dbconfig_configs_id = raw_config?.database?.rename?.["configs"] || /* istanbul ignore next */ DEFAULT_DB_CONFIG_CONFIG_ID;
const dbconfig_sys_map_id = raw_config?.database?.rename?.["sys"] || /* istanbul ignore next */ DEFAULT_DB_CONFIG_DBMAP_ID;

let raw_db_config: any = {};
try {
    raw_db_config = fs.existsSync(dbconfig_file_path)
        ? require(dbconfig_file_path)
        : /* istanbul ignore next */ {
              [dbconfig_types_id]: {},
              [dbconfig_configs_id]: {},
              [dbconfig_sys_map_id]: {},
          };
} catch {
    /* istanbul ignore next */ raw_db_config = {
        [dbconfig_types_id]: {},
        [dbconfig_configs_id]: {},
        [dbconfig_sys_map_id]: {},
    };
}

export const DATABASE_TYPES_MAP = raw_db_config[dbconfig_types_id] || /* istanbul ignore next */ {};
export const DATABASE_CONFIGS_MAP = raw_db_config[dbconfig_configs_id] || /* istanbul ignore next */ {};
export const DATABASE_SYS_DB_MAP = raw_db_config[dbconfig_sys_map_id] || /* istanbul ignore next */ {};

export const SESSION_LIFE_TIME = raw_config?.user?.session_life || /* istanbul ignore next */ 30;
export const USER_LOGIN_LIFE_TIME = raw_config?.user?.login || /* istanbul ignore next */ 10;

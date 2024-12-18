/** @format */

import fs from "fs";
import path from "path";
import { AreaCode, guid, parseAreaString } from "@aitianyu.cn/types";
import {
    GenericDatabaseTable,
    TianyuCSPConfig,
    TianyuCSPDatabaseConfig,
    TianyuCSPDatabaseTypes,
    TianyuCSPSystemDBMap,
} from "#interface";

export const INTERNAL_PROJECT_ROOT: string = __dirname;
export const PROJECT_ROOT_PATH: string = process.cwd();

const DEFAULT_CSP_CONFIG_NAME: string = "csp.config";
const DEFAULT_EXTERNAL_MODULE_PATH: string = "src";
const DEFAULT_DB_CONFIG_NAME: string = "db.config.js";

const DEFAULT_DB_CONFIG_TYPES_ID: string = "databaseTypes";
const DEFAULT_DB_CONFIG_CONFIG_ID: string = "databaseConfigs";
const DEFAULT_DB_CONFIG_DBMAP_ID: string = "SystemDatabaseMap";

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

const custom_db_config_file = path.resolve(PROJECT_ROOT_PATH, raw_config?.database?.custom || /* istanbul ignore next */ "");
let custom_db: any = [];
try {
    custom_db = fs.existsSync(custom_db_config_file) ? require(custom_db_config_file) : /* istanbul ignore next */ [];
} catch {
    /* istanbul ignore next */ custom_db = [];
}

export const DATABASE_TYPES_MAP: TianyuCSPDatabaseTypes = raw_db_config[dbconfig_types_id] || /* istanbul ignore next */ {};
export const DATABASE_CONFIGS_MAP: TianyuCSPDatabaseConfig = raw_db_config[dbconfig_configs_id] || /* istanbul ignore next */ {};
export const DATABASE_SYS_DB_MAP: TianyuCSPSystemDBMap = raw_db_config[dbconfig_sys_map_id] || /* istanbul ignore next */ {};
export const DATABASE_CUSTOM_MAP: GenericDatabaseTable[] = custom_db;
export const DATABASE_TABLES_MAP: GenericDatabaseTable[] = [...custom_db, ...Object.values(DATABASE_SYS_DB_MAP)];

export const SESSION_LIFE_TIME = raw_config?.user?.session_life || /* istanbul ignore next */ 30;
export const USER_LOGIN_LIFE_TIME = raw_config?.user?.login || /* istanbul ignore next */ 10;

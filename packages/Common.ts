/**
 * @format
 * @internal
 *
 * Tianyu CSP Common Data
 *
 * To export all path related defines, external configurations.
 */

import fs from "fs";
import path from "path";
import { guid, parseAreaString } from "@aitianyu.cn/types";
import { TianyuCSPAuditConfig, TianyuCSPConfig, TianyuCSPPrivilegeMap } from "#interface";

/** tianyu-csp node_modules root path */
export const INTERNAL_PROJECT_ROOT: string = __dirname;

/** Tianyu CSP application project root path */
export const PROJECT_ROOT_PATH: string = process.cwd();

const DEFAULT_CSP_CONFIG_NAME: string = "csp.config";
const DEFAULT_EXTERNAL_MODULE_PATH: string = "src";

// ###########################################################################################
// Processor for Tianyu CSP global configuration
// ###########################################################################################
const config_file_path = path.resolve(PROJECT_ROOT_PATH, DEFAULT_CSP_CONFIG_NAME);
let raw_config: TianyuCSPConfig | null = null;
if (fs.existsSync(`${config_file_path}.json`) || fs.existsSync(`${config_file_path}.js`)) {
    try {
        raw_config = require(config_file_path);
    } catch {
        /* istanbul ignore next */ raw_config = null;
    }
}

/** Tianyu CSP application project source code relation path (base project root path) */
export const PROJECT_ROOT_RELATION_PATH = raw_config?.config?.src || /* istanbul ignore next */ DEFAULT_EXTERNAL_MODULE_PATH;

/** Tianyu CSP application project source code absolute path */
export const EXTERNAL_MODULE_ROOT_PATH: string = path.resolve(PROJECT_ROOT_PATH, PROJECT_ROOT_RELATION_PATH);

/** Application Version */
export const PROJECT_VERSION = raw_config?.config?.version || /* istanbul ignore next */ "1.0.0";
/** Application Runtime environment */
export const PROJECT_ENVIRONMENT_MODE = raw_config?.config?.environment || /* istanbul ignore next */ "development";
/** Application Name */
export const PROJECT_NAME = raw_config?.config?.name || /* istanbul ignore next */ guid();
/** Application default language for processing */
export const PROJECT_DEFAULT_LANGUAGE = parseAreaString(raw_config?.config?.language, true);

/** Tianyu CSP application network url path configurations */
export const REST_CONFIG = raw_config?.rest;

/** Tianyu CSP application external function caller configuration */
export const SYSTEM_EXTERNAL_CALL = raw_config?.xcall || /* istanbul ignore next */ {};

// ###########################################################################################
// Processor for Tianyu CSP Privilege configuration
// ###########################################################################################
const privilege_map_path = path.resolve(PROJECT_ROOT_PATH, raw_config?.config?.roles || /* istanbul ignore next */ "");
let raw_privileges = {};
if (fs.existsSync(privilege_map_path)) {
    try {
        raw_privileges = require(privilege_map_path);
    } catch {
        /* istanbul ignore next */ raw_privileges = {};
    }
}

/** Tianyu CSP system privilege definition map */
export const SYSTEM_PRIVILEGE_MAP: TianyuCSPPrivilegeMap = raw_privileges;

export function getInDevMode(): boolean {
    return PROJECT_ENVIRONMENT_MODE.toLowerCase() === "development";
}

const audit_configuration_raw = raw_config?.config?.audit;
/** Application Audit configuration */
export const AUDIT_CONFIGURATION: TianyuCSPAuditConfig = {
    remote: audit_configuration_raw?.remote || "",
    path: audit_configuration_raw?.path || "",
    header: audit_configuration_raw?.header || {},
    port: audit_configuration_raw?.port || 514,
    family: audit_configuration_raw?.family || "IPv4",
    protocal: audit_configuration_raw?.protocal || "tcp",
    log: audit_configuration_raw?.log === undefined ? true : /* istanbul ignore next */ audit_configuration_raw?.log,
    buffer: audit_configuration_raw?.buffer || 10,
    plugin: audit_configuration_raw?.plugin || [],
};

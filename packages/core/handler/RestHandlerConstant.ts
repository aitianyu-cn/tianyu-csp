/** @format */

import fs from "fs";
import path from "path";
import { EXTERNAL_MODULE_ROOT_PATH, PROJECT_ROOT_PATH, REST_CONFIG } from "../../Common";
import { MapOfType } from "@aitianyu.cn/types";
import { DefaultRequestItemsMap, HttpRestItem, PathEntry } from "#interface";

const DEFAULT_REST_CONFIG_NAME = "rest.config.json";
const DEFAULT_REST_FALLBACK_CONFIG = {
    package: "$.default",
    module: "rest-fallback",
    method: "default",
};
const REST_CONFIG_FILE: string = REST_CONFIG?.file || /* istanbul ignore next */ "";
const REST_CONFIG_FALLBACK: any = REST_CONFIG?.fallback;
const DEFAULT_REQUEST_ITEM_MAP: DefaultRequestItemsMap = {
    language: { cookie: "X_LANGUAGE", search: "x-language" },
    session: { cookie: "X_SESSION", search: "x-session" },
};

const rest_file_path = path.resolve(PROJECT_ROOT_PATH, REST_CONFIG_FILE || /* istanbul ignore next */ DEFAULT_REST_CONFIG_NAME);
let raw_rest: MapOfType<HttpRestItem> = {};
if (fs.existsSync(rest_file_path)) {
    try {
        // raw_rest = JSON.parse(fs.readFileSync(rest_file_path, "utf-8"));
        raw_rest = require(rest_file_path);
    } catch {
        /* istanbul ignore next */ raw_rest = {};
    }
}

/** CSP default defined rest map */
export const REST = {
    ...raw_rest,

    // this is the default resets
};
/** Default rest fallback package */
/* istanbul ignore next */
export const DEFAULT_REST_FALLBACK: PathEntry =
    REST_CONFIG_FALLBACK?.package && REST_CONFIG_FALLBACK?.module
        ? {
              package: String(REST_CONFIG_FALLBACK.package),
              module: String(REST_CONFIG_FALLBACK.module),
              method: String(REST_CONFIG_FALLBACK.method),
          }
        : /* istanbul ignore next */ DEFAULT_REST_FALLBACK_CONFIG;

/** Request item key name map */
export const REST_REQUEST_ITEM_MAP = REST_CONFIG?.["request-map"] || /* istanbul ignore next */ DEFAULT_REQUEST_ITEM_MAP;
/** resources path of rest default loader */
export const REST_LOADER_RES_PATH = REST_CONFIG?.["loader"] || /* istanbul ignore next */ EXTERNAL_MODULE_ROOT_PATH;

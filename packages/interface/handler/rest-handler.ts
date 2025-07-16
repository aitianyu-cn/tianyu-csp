/** @format */

import { MapOfType } from "@aitianyu.cn/types";
import { HttpRequestCacheOption, HttpRequestProxyOption } from "../service/http-service";
import { ImportPackage } from "../api/importer";

/**
 * Request url path split items type
 *
 * @example
 * actual   // the item is a really path name
 * param    // the item is a parameter name, and the name will be converted to actual path name when processing
 * generic  // this item is a generic mapping
 */
export type SubitemType = "actual" | "param" | "generic";

/** Local Path script entry */
export interface PathEntry {
    /** package location */
    package: string;
    /** package module file name */
    module: string;
    /** package running method */
    method: string;
}

/** Request url split item structure */
export interface Subitem {
    /** subitem id */
    id: string | null;

    /** map of actual type */
    actual: MapOfType<Subitem>;
    /** map of parameter type */
    param: MapOfType<Subitem>;
    /** generic type item */
    generic: Subitem | null;
}

export interface HttpRestResult {
    /** Http Request handler */
    handler: ImportPackage;
    /** Http Request response cache option */
    cache?: HttpRequestCacheOption;
    /** Http Proxy setting */
    proxy?: HttpRequestProxyOption;
}

export type RestMappingResult = HttpRestResult | null;

/** @format */

import { MapOfType } from "@aitianyu.cn/types";
import { ImportPackage } from "./api/importer";
import { DefaultRequestItemsMap } from "./fwk-def/contributor/requests";

export interface TianyuCSPRequestMapItem {
    cookie: string;
    search: string;
}

export interface TianyuCSPXcall extends Record<string, MapOfType<ImportPackage> | undefined> {
    logger?: { log: ImportPackage };
    usage?: { record: ImportPackage };
    trace?: { trace: ImportPackage };
    feature?: { "is-active": ImportPackage };
    session?: { get: ImportPackage };
    user?: { get: ImportPackage };
    license?: { get: ImportPackage };
    role?: { get: ImportPackage };
    monitor?: { record: ImportPackage };
}

export interface TianyuCSPConfig {
    config?: {
        name?: string;
        version?: string;
        environment?: "development" | "production";
        src?: string;
        language?: string;
        roles?: string;
        monitor?: {
            modules?: string;
        };
    };
    rest?: {
        file: string;
        loader?: string;
        fallback?: ImportPackage;
        "request-map"?: DefaultRequestItemsMap;
    };
    xcall?: TianyuCSPXcall;
    user?: {
        login?: number;
        session_life?: number;
    };
}

/**
 * Type of supported opertion actions
 *
 * read: access a resource
 * write: open a resource and to do a data write operation
 * delete: remove a resource
 * change: to update a resource
 * execute: to start a job
 */
export type OperationActions = "read" | "write" | "delete" | "change" | "execute";

export interface TianyuCSPPrivilegeMap {
    [key: string]: {
        [action in OperationActions]?: boolean;
    };
}

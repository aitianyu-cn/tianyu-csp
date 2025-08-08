/**
 * @format
 * @public
 *
 * Tianyu CSP global configuration interface definitions
 */

import { MapOfType } from "@aitianyu.cn/types";
import { ImportPackage } from "./api/importer";
import { DefaultRequestItemsMap } from "./fwk-def/contributor/requests";
import { TianyuCSPAuditConfig } from "./api/audit";

/** Resquest cookie and search key mapping item */
export interface TianyuCSPRequestMapItem {
    /** key name of cookie */
    cookie: string;
    /** key name of search */
    search: string;
}

/** Infra external call defines */
export interface TianyuCSPXcall extends Record<string, MapOfType<ImportPackage> | undefined> {
    /** logger manager xcalls */
    logger?: {
        /** to record a runtime log */
        log: ImportPackage;
    };
    /** function usage manager xcalls */
    usage?: {
        /** to record a function used */
        record: ImportPackage;
    };
    /** error trace manager xcalls */
    trace?: {
        /** to record an error */
        trace: ImportPackage;
    };
    /** feature(function) enablement manager xcalls */
    feature?: {
        /** get feature is enabled */
        "is-active": ImportPackage;
    };
    /** user session manager xcalls */
    session?: {
        /** get session detail info */
        get: ImportPackage;
    };
    /** user info manager xcalls */
    user?: {
        /** get user info */
        get: ImportPackage;
    };
    /** user license manager xcalls */
    license?: {
        /** get license detail info */
        get: ImportPackage;
    };
    /** privilege manager xcalls */
    role?: {
        /** get privilege details for license */
        get: ImportPackage;
    };
}

/** Map of custom defined HTTP MIME */
export interface TianyuMIMEMap {
    /** MIME file extension */
    [key: string]: {
        /**
         * MIME content type
         * e.g.: image, application, text
         */
        content: string;
        /**
         * MIME file type
         * e.g.: jpg, css, html
         */
        file: string;
        /** indicates whether the data should be transferred as binary data */
        binary?: boolean;
    };
}

/** Tianyu CSP global config type define */
export interface TianyuCSPConfig {
    /** basic config */
    config?: {
        /** application name */
        name?: string;
        /** application version */
        version?: string;
        /**
         * application runtime environment
         *
         * @field development
         * @field production
         */
        environment?: "development" | "production";
        /** application source code folder path */
        src?: string;
        /** application default language */
        language?: string;
        /** application privileges defines file */
        roles?: string;
        /** application audit configuration */
        audit?: Partial<TianyuCSPAuditConfig>;
    };
    /** network request url define */
    rest?: {
        /** network request url define file path */
        file: string;
        /**
         * path for tianyu csp resource loader
         * the basic path of loader to search the resources.
         * the path is based on project root path
         */
        loader?: string;
        /**
         * Path list of loader
         * indicates which path should be ignored from loader and return a 403 forbidden
         */
        loaderIgnorePattern?: string[];
        /** fallback handling entry */
        fallback?: ImportPackage;
        /** key name map of request default value */
        "request-map"?: DefaultRequestItemsMap;
        /**
         * error page redirection map
         * '{number}' parameter can be used
         * this is two parameters will be set: {0} is the origin url, {1} is the search list of origin url
         */
        errorpage?: {
            /** 404 page redirection url */
            404?: string;
            /** 403 page redirection url */
            403?: string;
        };
        /** HTTP MIME type custom map */
        mime?: TianyuMIMEMap;
    };
    /** external call define */
    xcall?: TianyuCSPXcall;
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

/** privilege map */
export interface TianyuCSPPrivilegeMap {
    [key: string]: {
        [action in OperationActions]?: boolean;
    };
}

/** @format */

import { TianyuCSPSystemDBMap } from "#interface";

export const DEFAULT_SYS_DB_MAP: TianyuCSPSystemDBMap = {
    logger: {
        database: "csp_sys",
        table: "logger",
        field: {
            user: { name: "user", type: "char", size: 45 },
            level: { name: "level", type: "tinyint", size: 3, default: "0" },
            time: { name: "time", type: "char", size: 45 },
            msg: { name: "msg", type: "text" },
        },
    },
    usage: {
        database: "csp_sys",
        table: "usage",
        field: {
            user: { name: "user", type: "char", size: 45 },
            func: { name: "func_name", type: "varchar", size: 255 },
            action: { name: "action", type: "char", size: 10 },
            time: { name: "time", type: "char", size: 45 },
            msg: { name: "msg", type: "text" },
        },
    },
    trace: {
        database: "csp_sys",
        table: "trace",
        field: {
            user: { name: "user", type: "char", size: 45 },
            id: { name: "trace_id", type: "char", size: 45 },
            time: { name: "time", type: "char", size: 45 },
            msg: { name: "msg", type: "text" },
            error: { name: "error_msg", type: "text" },
            area: { name: "area", type: "char", size: 5, default: "edge" },
        },
    },
    feature: {
        database: "csp_sys",
        table: "feature",
        field: {
            id: { name: "id", type: "char", size: 45 },
            enable: { name: "enable", type: "tinyint", size: 3, default: "0" },
            desc: { name: "desc", type: "text" },
            deps: { name: "deps", type: "text" },
        },
    },

    session: {
        database: "csp_user",
        table: "session",
        field: {
            id: { name: "session_id", type: "char", size: 45 },
            user: { name: "user", type: "char", size: 45 },
            time: { name: "time", type: "char", size: 45 },
        },
    },
    user: {
        database: "csp_user",
        table: "user_tb",
        field: {
            id: { name: "user_id", type: "char", size: 45 },
            email: { name: "email", type: "char", size: 255 },
            skey: { name: "sec_key", type: "char", size: 400 },
            name: { name: "dsp_name", type: "char", size: 255 },
            license: { name: "license", type: "char", size: 45, default: "" },
            team: { name: "team", type: "text" },
        },
    },
    license: {
        database: "csp_user",
        table: "license_tb",
        field: {
            id: { name: "license_id", type: "char", size: 45 },
            name: { name: "dsp_name", type: "char", size: 255 },
            desc: { name: "desc", type: "text" },
            admin: { name: "sys_mode", type: "tinyint", size: 3, default: "0" },
        },
    },
    role: {
        database: "csp_user",
        table: "role_tb",
        field: {
            lid: { name: "license_id", type: "char", size: 45 },
            name: { name: "fun_name", type: "char", size: 255 },

            read: { name: "read", type: "tinyint", size: 3, default: "0" },
            write: { name: "write", type: "tinyint", size: 3, default: "0" },
            delete: { name: "delete", type: "tinyint", size: 3, default: "0" },
            change: { name: "change", type: "tinyint", size: 3, default: "0" },
            execute: { name: "execute", type: "tinyint", size: 3, default: "0" },
        },
    },
    team: {
        database: "csp_user",
        table: "teams_tb",
        field: {
            id: { name: "id", type: "char", size: 45 },
            name: { name: "name", type: "char", size: 255 },
            desc: { name: "desc", type: "text" },
        },
    },
};

export const DEFAULT_REST_REQUEST_ITEM_MAP = {
    language: {
        cookie: "LANGUAGE",
        search: "x-language",
    },
    session: "SESSION_ID",
};

export const SUPPORTED_SUFFIX = ["", ".ts", ".js", ".json"];

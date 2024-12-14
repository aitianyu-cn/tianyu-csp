/** @format */

export const DEFAULT_SYS_DB_MAP = {
    logger: {
        database: "infra_db",
        table: "log_tb",
        field: {
            user: "user",
            levle: "level",
            time: "time",
            msg: "msg",
        },
    },
    usage: {
        database: "csp_sys",
        table: "usage",
        field: {
            user: "user_id",
            func: "func_name",
            action: "action",
            time: "time",
            msg: "msg",
        },
    },
    trace: {
        database: "csp_sys",
        table: "trace",
        field: {
            user: "user_id",
            id: "trace_id",
            time: "time",
            msg: "msg",
            error: "error_msg",
            area: "area",
        },
    },
    feature: {
        database: "csp_sys",
        table: "feature",
        field: {
            id: "id",
            enable: "enable",
            desc: "desc",
            deps: "deps",
        },
    },

    session: {
        database: "csp_user",
        table: "session",
        field: {
            id: "session_id",
            user: "user_id",
            time: "time",
        },
    },
    user: {
        database: "csp_user",
        table: "user_tb",
        field: {
            id: "user_id",
            email: "email",
            skey: "sec_key",
            name: "dsp_name",
            license: "license",
            team: "team",
        },
    },
    license: {
        database: "csp_user",
        table: "license_tb",
        field: {
            id: "license_id",
            name: "dsp_name",
            desc: "desc",
            admin: "sys_mode",
        },
    },
    role: {
        database: "csp_user",
        table: "role_tb",
        field: {
            lid: "license_id",
            name: "fun_name",

            read: "read",
            write: "write",
            delete: "delete",
            change: "change",
            execute: "execute",
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

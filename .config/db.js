/** @format */

module.exports.DatabaseTypesMap = {
    csp_sys: "mysql",
    csp_user: "mysql",
};
module.exports.DatabaseConfigMap = {
    csp_sys: {
        host: "server.tencent.backend.aitianyu.cn",
        port: 3306,
        user: "root",
        password: "ysy1998ysy[]",
    },
    csp_user: {
        host: "server.tencent.backend.aitianyu.cn",
        port: 3306,
        user: "root",
        password: "ysy1998ysy[]",
    },
};

module.exports.SystemDBMap = {
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
        index: "btree",
        field: {
            id: { name: "id", type: "char", size: 45, primary: true },
            enable: { name: "enable", type: "tinyint", size: 3, default: "0" },
            desc: { name: "desc", type: "text" },
            deps: { name: "deps", type: "text" },
        },
    },

    session: {
        database: "csp_user",
        table: "session",
        index: "btree",
        field: {
            id: { name: "session_id", type: "char", size: 45, primary: true },
            user: { name: "user", type: "char", size: 45 },
            time: { name: "time", type: "char", size: 45 },
        },
    },
    user: {
        database: "csp_user",
        table: "user_tb",
        index: "btree",
        field: {
            id: { name: "user_id", type: "char", size: 45, primary: true },
            email: { name: "email", type: "char", size: 255, index: "btree" },
            skey: { name: "sec_key", type: "text" },
            name: { name: "dsp_name", type: "char", size: 255, index: "hash" },
            license: { name: "license", type: "char", size: 45, default: "" },
            team: { name: "team", type: "text" },
        },
    },
    license: {
        database: "csp_user",
        table: "license_tb",
        index: "btree",
        field: {
            id: { name: "license_id", type: "char", size: 45, primary: true },
            name: { name: "dsp_name", type: "char", size: 255 },
            desc: { name: "desc", type: "text" },
            admin: { name: "sys_mode", type: "tinyint", size: 3, default: "0" },
        },
    },
    role: {
        database: "csp_user",
        table: "role_tb",
        index: "btree",
        field: {
            lid: { name: "license_id", type: "char", size: 45, primary: true },
            name: { name: "fun_name", type: "char", size: 255, primary: true },

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
        index: "btree",
        field: {
            id: { name: "id", type: "char", size: 45, primary: true },
            name: { name: "name", type: "char", size: 255 },
            desc: { name: "desc", type: "text" },
        },
    },
};

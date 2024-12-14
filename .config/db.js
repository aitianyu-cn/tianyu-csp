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
            user: "user",
            level: "level",
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
    team: {
        database: "csp_user",
        table: "team_tb",
        field: {
            id: "id",
            name: "name",
            desc: "desc",
        },
    },
};

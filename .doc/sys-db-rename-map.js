/** @format */

/**
 * This is a template configuration JS file for "System Basic Database Rename Map"
 *
 * The reference database setting in "csp.config.json", please see the below notes
 *
 * "database": {
 *      "file": "",
 *      "rename": {
 *          "types": "db_types",
 *          "configs": "db_config",
 *          "sys": "db_map"
 *       }
 *  },
 */

/** @type {{[dbname: string]: SupportedDatabaseType}} */
module.exports.db_types = {
    db1: "mysql", // replace a real db name in your database
    db2: "mysql",
};

/** @type {{[dbname: string]: IDatabaseConnectionConfig}} */
module.exports.db_config = {
    db1: {}, // details of the config, please refer interface IDatabaseConnectionConfig
    db2: {},
};

/**
 * @description
 * the structure of db_map please DO NOT to change. you can change the database name,
 * table name and field item values to adapt your database.
 * @type {{[dbname: string]: {database: string; table: string; field: {[key: string]: string}}}}
 *
 * @field logger
 * @field usage
 * @field trace
 * @field feature
 * @field session
 * @field user
 * @field license
 * @field role
 * @field team
 *
 */
module.exports.db_map = {
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

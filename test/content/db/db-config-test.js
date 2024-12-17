/** @format */

module.exports.DBConfigs = {
    csp_sys: {
        type: "mysql",
        config: {
            host: "server.tencent.backend.aitianyu.cn",
            port: 3306,
            user: "root",
            password: "ysy1998ysy[]",
        },
    },
    csp_user: {
        type: "mysql",
        config: {
            host: "server.tencent.backend.aitianyu.cn",
            port: 3306,
            user: "root",
            password: "ysy1998ysy[]",
        },
    },
};

module.exports.DBTables = [
    {
        database: "csp_user",
        table: "user_tb",
        index: "btree",
        data: "test/content/db/user-data.json",
        field: {
            id: { name: "user_id", type: "char", size: 45, primary: true },
            email: { name: "email", type: "char", size: 255, index: "btree" },
            skey: { name: "sec_key", type: "text" },
            name: { name: "dsp_name", type: "char", size: 255, index: "hash" },
            license: { name: "license", type: "char", size: 45, default: "" },
            team: { name: "team", type: "text" },
        },
    },
    {
        database: "csp_sys",
        table: "feature",
        index: "btree",
        data: "test/content/db/feature-data.json",
        field: {
            id: { name: "id", type: "char", size: 45, primary: true },
            enable: { name: "enable", type: "tinyint", size: 3, default: "0" },
            desc: { name: "desc", type: "text", default: "" },
            deps: { name: "deps", type: "text", default: "" },
        },
    },
    {
        database: "csp_user",
        table: "session",
        index: "btree",
        field: {
            id: { name: "session_id", type: "char", size: 45, primary: true },
            user: { name: "user", type: "char", size: 45 },
            time: { name: "time", type: "char", size: 45 },
        },
    },
];

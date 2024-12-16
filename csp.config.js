/** @format */

module.exports = {
    config: {
        name: "CSP-Test-App",
        version: "1.0.0",
        environment: "development",
        src: "scripts",
        language: "zh_CN",
    },
    rest: {
        file: ".config/rest.js",
        "request-map": {
            language: {
                cookie: "LANGUAGE",
                search: "x-language",
            },
            session: "SESSION_ID",
        },
        loader: "data",
    },
    database: {
        file: ".config/db.js",
        rename: {
            types: "DatabaseTypesMap",
            configs: "DatabaseConfigMap",
            sys: "SystemDBMap",
        },
        custom: ".config/custom-db.js",
    },
    user: {
        login: 10,
        session_life: 30,
    },
};

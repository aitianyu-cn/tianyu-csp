/** @format */

module.exports = {
    config: {
        name: "CSP-Test-App",
        version: "1.0.0",
        environment: "development",
        src: "scripts",
        language: "zh_CN",
        roles: ".config/privilege.json",
        monitor: {
            modules: ".config/monitor-allowlist.json",
        },
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
    xcall: {
        logger: { log: { package: "db", module: "runtime", method: "log" } },
        usage: { record: { package: "db", module: "runtime", method: "recordUsage" } },
        trace: { trace: { package: "db", module: "runtime", method: "trace" } },

        feature: { "is-active": { package: "db", module: "feature", method: "isActive" } },

        session: { get: { package: "db", module: "session", method: "getter" } },
        user: { get: { package: "db", module: "user", method: "getter" } },
        license: { get: { package: "db", module: "license", method: "getter" } },
        role: { get: { package: "db", module: "role", method: "getter" } },
    },
    user: {
        login: 10,
        session_life: 30,
    },
};

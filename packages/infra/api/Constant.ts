/** @format */

export const EXIT_CODES = {
    FATAL_ERROR: -100,
    NO_ERROR: 0,
};

export const NODE_ENV_CONFIG_NAMES = {
    ENVIRONMENT: "environment",
};

export const INFRA_DEFAULT_PRIVILEGE_LIST = {
    TRACE: {
        key: "Trace",
        des: "To describe a user whether can operate trace data",
    },
    USAGE: {
        key: "Usage",
        des: "To describe a user whether can operate usage data",
    },
};

export const GENERAL_OPERATION_ERROR_CODE = {
    OPERATION_NO_PRIVILEGE: "300",
};

export const DATABASE_EXECUTION_ERROR_CODE = {
    DB_CORE_ERROR: "100",
    DB_EXECUTION_ERROR: "200",
    DB_SQL_ERROR: "201",
    DB_OTHER_ERROR_NO_FATAL: "202",
};

export const DB_DEFAULT_TABLE_MAPPING_INFO = {
    FEATURES: {
        DATABASE_NAME: "infra_db",
        TABLE_NAME: "features_tb",
    },
    TRACE: {
        DATABASE_NAME: "infra_db",
        TABLE_NAME: "trace_tb",
    },
    USAGE: {
        DATABASE_NAME: "infra_db",
        TABLE_NAME: "usage_tb",
    },
    LOGGER: {
        DATABASE_NAME: "infra_db",
        TABLE_NAME: "log_tb",
    },
    AUTHORIZATION: {
        DATABASE_NAME: "secure_db",

        ROLE_MAP: "role_tb",
        USER_TABLE: "user_tb",
        TEAMS_TABLE: "team_tb",
        LICENSIS_TABLE: "licenses_tb",
    },
};

export const BACKEND_SESSION_USER = "00000000-0000-0000-0000-000000000000";

export const GlobalTemplateSQL: any = {
    clear: {
        mysql: "TRUNCATE TABLE `{0}`.`{1}`;",
    },
    delete: {
        mysql: "DELETE FROM `{0}`.`{1}` WHERE `user` = '{2}';",
    },
    count: {
        mysql: "SELECT COUNT(*) AS `count` FROM `{0}`.`{1}` WHERE {2};",
    },
};

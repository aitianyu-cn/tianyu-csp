/** @format */

import { SyncOperationCallback } from "../Constant";
import { SecureContextOptions } from "tls";

export interface IDatabaseAPIBase {
    execute(databaseName: string, sql: string, callback: SyncOperationCallback, forceSql?: boolean): void;
    executeAsync<TR = any>(databaseName: string, sql: string, forceSql?: boolean): Promise<TR>;
}

export const DATABASE_EXECUTION_ERROR_CODE = {
    DB_CORE_ERROR: "100",
    DB_EXECUTION_ERROR: "200",
    DB_SQL_ERROR: "201",
    DB_OTHER_ERROR_NO_FATAL: "202",
};

export type DefaultAuthorTableId = "role" | "user" | "team" | "licenses";

export type DefaultTableId = "feature" | "trace" | "usage" | "logger" | DefaultAuthorTableId;

export interface IDatabaseManager {
    isValid: boolean;
    connect(databaseName: string): IDatabaseAPIBase;
    databaseType(databaseName: string): SupportedDatabaseType;
    mappingTable(tableId: DefaultTableId): DatabaseDefaultTableMap & { tableMapping: string };
}

export enum DatabaseTypes {
    DECIMAL = 0x00, // DECIMAL
    TINY = 0x01, // TINYINT, 1 byte
    SHORT = 0x02, // SMALLINT, 2 bytes
    LONG = 0x03, // INT, 4 bytes
    FLOAT = 0x04, // FLOAT, 4-8 bytes
    DOUBLE = 0x05, // DOUBLE, 8 bytes
    NULL = 0x06, // NULL (used for prepared statements, I think)
    TIMESTAMP = 0x07, // TIMESTAMP
    LONGLONG = 0x08, // BIGINT, 8 bytes
    INT24 = 0x09, // MEDIUMINT, 3 bytes
    DATE = 0x0a, // DATE
    TIME = 0x0b, // TIME
    DATETIME = 0x0c, // DATETIME
    YEAR = 0x0d, // YEAR, 1 byte (don't ask)
    NEWDATE = 0x0e, // ?
    VARCHAR = 0x0f, // VARCHAR (?)
    BIT = 0x10, // BIT, 1-8 byte
    TIMESTAMP2 = 0x11, // TIMESTAMP with fractional seconds
    DATETIME2 = 0x12, // DATETIME with fractional seconds
    TIME2 = 0x13, // TIME with fractional seconds
    JSON = 0xf5, // JSON
    NEWDECIMAL = 0xf6, // DECIMAL
    ENUM = 0xf7, // ENUM
    SET = 0xf8, // SET
    TINY_BLOB = 0xf9, // TINYBLOB, TINYTEXT
    MEDIUM_BLOB = 0xfa, // MEDIUMBLOB, MEDIUMTEXT
    LONG_BLOB = 0xfb, // LONGBLOG, LONGTEXT
    BLOB = 0xfc, // BLOB, TEXT
    VAR_STRING = 0xfd, // VARCHAR, VARBINARY
    STRING = 0xfe, // CHAR, BINARY
    GEOMETRY = 0xff, // GEOMETRY
}

export interface IDatabaseConnectionConfig {
    /** The hostname of the database you are connecting to. (Default: localhost) */
    host?: string | undefined;
    /** The port number to connect to. (Default: 3306) */
    port?: number | undefined;
    /** The source IP address to use for TCP connection */
    localAddress?: string | undefined;
    /** The path to a unix domain socket to connect to. When used host and port are ignored */
    socketPath?: string | undefined;
    /** The timezone used to store local dates. (Default: 'local') */
    timezone?: string | undefined;
    /** The milliseconds before a timeout occurs during the initial connection to the MySQL server. (Default: 10 seconds) */
    connectTimeout?: number | undefined;
    /** Stringify objects instead of converting to values. (Default: 'false') */
    stringifyObjects?: boolean | undefined;
    /** Allow connecting to MySQL instances that ask for the old (insecure) authentication method. (Default: false) */
    insecureAuth?: boolean | undefined;
    /** A custom query format function */
    queryFormat?(query: string, values: any): string;
    /** When dealing with big numbers (BIGINT and DECIMAL columns) in the database, you should enable this option (Default: false) */
    supportBigNumbers?: boolean | undefined;

    /**
     * Enabling both supportBigNumbers and bigNumberStrings forces big numbers (BIGINT and DECIMAL columns) to be
     * always returned as JavaScript String objects (Default: false). Enabling supportBigNumbers but leaving
     * bigNumberStrings disabled will return big numbers as String objects only when they cannot be accurately
     * represented with [JavaScript Number objects] (http://ecma262-5.com/ELS5_HTML.htm#Section_8.5)
     * (which happens when they exceed the [-2^53, +2^53] range), otherwise they will be returned as Number objects.
     * This option is ignored if supportBigNumbers is disabled.
     */
    bigNumberStrings?: boolean | undefined;
    /**
     * Force date types (TIMESTAMP, DATETIME, DATE) to be returned as strings rather then inflated into JavaScript
     * Date objects. Can be true/false or an array of type names to keep as strings. (Default: false)
     */
    dateStrings?: boolean | Array<"TIMESTAMP" | "DATETIME" | "DATE"> | undefined;
    /**
     * This will print all incoming and outgoing packets on stdout.
     * You can also restrict debugging to packet types by passing an array of types (strings) to debug;
     *
     * (Default: false)
     */
    debug?: boolean | string[] | DatabaseTypes[] | undefined;
    /**
     * Generates stack traces on errors to include call site of library entrance ("long stack traces"). Slight
     * performance penalty for most calls. (Default: true)
     */
    trace?: boolean | undefined;

    /** Allow multiple mysql statements per query. Be careful with this, it exposes you to SQL injection attacks. (Default: false) */
    multipleStatements?: boolean | undefined;
    /** List of connection flags to use other than the default ones. It is also possible to blacklist default ones */
    flags?: string | string[] | undefined;
    /** object with ssl parameters or a string containing name of ssl profile */
    ssl?: string | (SecureContextOptions & { rejectUnauthorized?: boolean | undefined }) | undefined;
}

export type SupportedDatabaseType = "mysql";

export type DatabaseDefaultTableMap = { dbName: string };

export interface DatabaseDefaultTableMapping {
    features?: DatabaseDefaultTableMap & { tableMapping: string };
    trace?: DatabaseDefaultTableMap & { tableMapping: string };
    usage?: DatabaseDefaultTableMap & { tableMapping: string };
    logger?: DatabaseDefaultTableMap & { tableMapping: string };
    authorization?: DatabaseDefaultTableMap & {
        roleMapsTable?: string;
        userTable?: string;
        teamsTable?: string;
        licensesTable?: string;
    };
}

export interface IDatabaseConnectTemplate {
    config: IDatabaseConnectionConfig;
    dbType: SupportedDatabaseType;
    defaultTableMapping?: DatabaseDefaultTableMapping;
}

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

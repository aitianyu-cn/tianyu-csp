/** @format */

import { MapOfString, MapOfType } from "@aitianyu.cn/types";
import Redis from "ioredis";
import { SecureContextOptions } from "tls";

export type SupportedNosqlDBType = "redis";

export type SupportedSqlDBType = "mysql";

/** Tianyu CSP supported database type */
export type SupportedDatabaseType = SupportedNosqlDBType | SupportedSqlDBType;

/** CSP database connection basic options */
export interface ConnectionOptions {
    /** The user to authenticate as */
    user?: string | undefined;
    /** The password of user */
    password?: string | undefined;
    /** Name of the database to use for this connection */
    database?: string | undefined;
    /**
     * The charset for the connection. This is called "collation" in the SQL-level of DB (like utf8_general_ci).
     * If a SQL-level charset is specified (like utf8mb4) then the default collation for that charset is used.
     * (Default: 'UTF8')
     */
    charset?: string | undefined;
    /** Number of milliseconds */
    timeout?: number | undefined;
}

/** CSP database connection config */
export interface IDatabaseConnectionConfig extends ConnectionOptions {
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

export type DatabaseFieldType =
    | "char"
    | "varchar"
    | "text"
    | "longtext"
    | "tinyint"
    | "int"
    | "float"
    | "double"
    | "decimal"
    | "bigint"
    | "boolean";

export type TableIndexType = "btree" | "hash";

export interface IDatabaseFieldDefine {
    type: DatabaseFieldType;
    size?: number;
    decimal?: number;

    zero?: boolean;
    unsign?: boolean;

    nullable?: boolean;
    default?: string;

    name: string;

    primary?: boolean;
    index?: TableIndexType;
}

export interface IDatabaseInstallConfig {
    [key: string]: {
        config: IDatabaseConnectionConfig;
        tables: {
            [table: string]: {
                fields: IDatabaseFieldDefine[];
                index?: TableIndexType;
                data: string[];
            };
        };
    };
}

export interface GenericDatabaseTable {
    database: string;
    table: string;
    index?: TableIndexType;
    data?: MapOfString[] | string;
    field: MapOfType<IDatabaseFieldDefine>;
}

/** CSP database manager config */
export interface DatabaseConfig {
    /** Map of database and its database type */
    dbTypes: MapOfType<SupportedDatabaseType>;
    /** Map of database and its db configuration */
    configMap: MapOfType<IDatabaseConnectionConfig>;
}

/** Database Lifecycle interface */
export interface IDBLifecycle {
    /** To close database connection */
    close(): void;
}

/** CSP Database Connection */
export interface IDBConnection extends IDBLifecycle {
    name: string;
    /**
     * To execute a single query without return value
     *
     * @param databaseName target database name
     * @param sql query sql
     */
    execute(sql: string): Promise<void>;
    /**
     * To execute a list of queries in a transaction without return value
     *
     * @param databaseName target database name
     * @param sql query sqls
     */
    executeBatch(sql: string[]): Promise<void>;

    /**
     * To execute a single query and return the query result
     *
     * @param databaseName target database name
     * @param sql query sql
     *
     * @returns return query results
     */
    query(sql: string): Promise<any>;
}

export interface INosqlDBManager {
    redis(database: string, config: IDatabaseConnectionConfig): Redis;
}

/** CSP Database manager for Global */
export interface IDatabaseManager {
    /**
     * To create a connection for a database
     *
     * @param databaseName connected database name
     *
     * @returns return a connection instance
     */
    connect(type: SupportedSqlDBType, databaseName: string, config: IDatabaseConnectionConfig): IDBConnection;
    /** Manager for nosql database */
    nosql: INosqlDBManager;
}

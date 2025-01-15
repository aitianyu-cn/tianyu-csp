/** @format */

/** CSP infra error codes */
export const INFRA_ERROR_CODES = {
    /** database general error */
    DATABASE_GENERAL_ERROR: "10000",
    /** database connection created failed */
    DATABASE_CONNECTION_CREATION_ERROR: "10001",
    /** database query execution failed */
    DATABASE_QUERY_EXECUTION_ERROR: "10002",
    /** database query transaction start failed */
    DATABASE_QUERY_TRANSACTION_ERROR: "10003",
    /** database batch query execution failed */
    DATABASE_BATCH_QUERY_EXECUTION_ERROR: "10004",
    // DATABASE_COMMAND_INVALID: "10005",
    // DATABASE_COMMAND_UNSUPPORT_FOR_TYPE: "10006",
    /** error when executing external system api call */
    EXTERNAL_SYSTEM_API_CALL_FAILED: "9900",
};

/** CSP service error codes */
export const SERVICE_ERROR_CODES = {
    /** an unknown error occurs when service running */
    INTERNAL_ERROR: "20000",
    /** HTTP service received an unsupported method request */
    REQUEST_METHOD_NOT_SUPPORT: "20001",
    /** service could not to found a handler to process received action */
    SERVICE_HANDLER_LOST: "20002",
    /** could not find a handler to process http request url path */
    REQUEST_PATH_INVALID: "20003",
    /** the api or feature is not valid */
    SERVICE_NOT_SUPPORTED: "20004",
    /** the connection to service has error */
    SERVICE_REQUEST_ERROR: "20005",

    /** user session is not established */
    USER_SESSION_NOT_VALID: "30000",
    /** user session is timeout */
    USER_SESSION_OUT_OF_TIME: "30001",
    /** specified user is not found */
    USER_NOT_FOUND: "30002",
    /** read a license info failed */
    LICENSE_ERROR: "30003",

    /** failed to initialize a job worker */
    JOB_RUNNING_INITIAL_FAILED: "40000",
    /** try to dispatch a job to a job worker which is running */
    PRE_JOB_RUNNING: "40001",
    /** try to dispatch a job to a worker which is in failed status and not reseted */
    PRE_JOB_INVALID: "40002",
    /** job execution timeout */
    JOB_EXECUTION_TIMEOUT: "40003",
};

/** default http host ip */
export const DEFAULT_HTTP_HOST = "0.0.0.0";
/** default http host port */
export const DEFAULT_HTTP_PORT = 30010;

/** default request language item key name */
export const DEFAULT_REQUEST_LANGUAGE_ITEM = "language";

/** the maximum job count of job manager */
export const DEFAULT_MAX_JOB_COUNT = 1024;
/** default job running timeour time is 5min */
export const DEFAULT_JOB_OVERTIME = 300000;

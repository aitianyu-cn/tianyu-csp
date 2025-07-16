/** @format */

import { LogLevel, MapOfType } from "@aitianyu.cn/types";
import { SocketAddressFamily, SocketProtocal } from "../service/socket-service";
import { HttpProtocal } from "../service/http-service";
import { ImportPackage } from "./importer";

/** Audit Configuration defines */
export interface TianyuCSPAuditConfig {
    /** Audit remote service IP address or host name */
    remote: string;
    /** Audit remote service HTTP request path (HTTP only) */
    path: string;
    /** Audit remote service HTTP request header (HTTP only) */
    header: MapOfType<string | string[]>;
    /** Audit remote service port (default 514) */
    port: number;
    /** Audit remote service IP family (default IPv4) */
    family: SocketAddressFamily;
    /** Audit remote service supported protocal (default UDP) */
    protocal: SocketProtocal | HttpProtocal;
    /** To record audit data into logger manager */
    log: boolean;
    /** Audit message queue buffer size */
    buffer: number;
    /** Audit data processing plugin */
    plugin: ImportPackage[];
}

/** CSP Audit API for global */
export interface IAudit {
    /**
     * To record an audit data to remote server and log
     * (Additional data will only be recorded when protocal is not UDP)
     *
     * @param app local application name - to distinguish different feature
     * @param message audit message
     * @param level audit message level
     * @param additionalData audit additional data
     */
    record(app: string, message: string, level?: LogLevel, additionalData?: any): Promise<void>;

    /**
     * To record an error to remote server and log
     * (Additional data will only be recorded when protocal is not UDP)
     *
     * @param app local application name - to distinguish different feature
     * @param message audit message
     * @param additionalData audit additional data
     */
    error(app: string, message: string, additionalData?: any): Promise<void>;

    /**
     * To record a debug to remote server and log
     * (Additional data will only be recorded when protocal is not UDP)
     *
     * @param app local application name - to distinguish different feature
     * @param message audit message
     * @param additionalData audit additional data
     */
    debug(app: string, message: string, additionalData?: any): Promise<void>;

    /**
     * To record a warn to remote server and log
     * (Additional data will only be recorded when protocal is not UDP)
     *
     * @param app local application name - to distinguish different feature
     * @param message audit message
     * @param additionalData audit additional data
     */
    warn(app: string, message: string, additionalData?: any): Promise<void>;

    /** Manually send audit data to remote service */
    flush(): Promise<void>;
}

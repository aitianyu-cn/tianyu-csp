/** @format */

import { IDatabaseManager } from "./api/database";
import { IEnvironment } from "./api/environment";
import { ICSPFramework } from "./api/fwk";
import { IImporter } from "./api/importer";
import { IServerRequest } from "./api/request";

/** CSP core components definition for global calling */
export interface IGlobalDefinition {
    // /** Core Trace instance */
    // trace: ITrace;
    // /** Core Logger instance */
    // logger: ILogger;
    // /** Core Usage Recorder instance */
    // usage: IUsage;
    // /** Request Session instance */
    // session: ISession;

    /** Database Access instance */
    db: IDatabaseManager;
    /** Import Manager */
    import: IImporter;
    /** Monitor Manager */
    // monitor: IMonitor;
    /** Framework utils */
    fwk: ICSPFramework;

    /** Network request data */
    request: IServerRequest;
    /** Runtime environments data */
    environment: IEnvironment;
}

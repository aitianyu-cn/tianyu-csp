/** @format */

import { IDatabaseManager } from "./api/database";
import { IEnvironment } from "./api/environment";
import { IImporter } from "./api/importer";
import { ILogger } from "./api/logger";
import { IMonitor } from "./api/monitor";
import { IServerRequest } from "./api/request";
import { ISession } from "./api/session";
import { ITrace } from "./api/trace";
import { IUsage } from "./api/usage";

/** CSP core components definition for global calling */
export interface IGlobalDefinition {
    /** Core Trace instance */
    trace: ITrace;
    /** Core Logger instance */
    logger: ILogger;
    /** Core Usage Recorder instance */
    usage: IUsage;
    /** Request Session instance */
    session: ISession;

    /** Database Access instance */
    db: IDatabaseManager;
    /** Import Manager */
    import: IImporter;
    /** Monitor Manager */
    monitor: IMonitor;

    /** Network request data */
    request: IServerRequest;
    /** Runtime environments data */
    environment: IEnvironment;
}

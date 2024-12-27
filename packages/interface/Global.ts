/** @format */

import { IDatabaseManager } from "./api/db/database";
import { IEnvironment } from "./api/environment";
import { IFeature } from "./api/feature";
import { ICSPFramework } from "./api/fwk";
import { IImporter } from "./api/importer";
import { ILogger } from "./api/logger";
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
    // monitor: IMonitor;
    /** Framework utils */
    fwk: ICSPFramework;
    /** Feature Manager instance to get a feature is active only */
    feature: IFeature;

    /** Network request data */
    request: IServerRequest;
    /** Runtime environments data */
    environment: IEnvironment;
}

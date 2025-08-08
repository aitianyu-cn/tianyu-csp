/** @format */

import { IAudit } from "./api/audit";
import { IEnvironment } from "./api/environment";
import { IFeature } from "./api/feature";
import { ICSPFramework } from "./api/fwk";
import { IImporter } from "./api/importer";
import { ILifecycle } from "./api/lifecycle";
import { ILogger } from "./api/logger";
import { IServerRequest } from "./api/request";
import { ISession } from "./api/session";
import { ITrace } from "./api/trace";
import { IUsage } from "./api/usage";

/**
 * @public
 *
 * CSP core components definition for global calling
 */
export interface IGlobalDefinition {
    /** Core Trace instance */
    trace: ITrace;
    /**
     * @deprecated
     * Core Logger instance
     */
    logger: ILogger;
    /** Core Usage Recorder instance */
    usage: IUsage;
    /** Request Session instance */
    session: ISession;
    /** Core Audit instance */
    audit: IAudit;

    /** Import Manager */
    import: IImporter;
    /** Framework utils */
    fwk: ICSPFramework;
    /** Feature Manager instance to get a feature is active only */
    feature: IFeature;
    /**
     * Core Lifecycle instance
     * This is a generic instance for service lifecycle
     */
    lifecycle: ILifecycle;

    /** Network request data */
    request: IServerRequest;
    /** Runtime environments data */
    environment: IEnvironment;
}

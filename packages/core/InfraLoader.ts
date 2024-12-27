/** @format */

import { IGlobalDefinition, IServerRequest, ISession } from "#interface";
import { PROJECT_ENVIRONMENT_MODE, PROJECT_NAME, PROJECT_ROOT_PATH, PROJECT_VERSION } from "../Common";
import { ContributorManager } from "./infra/ContributorManager";
import { DatabaseManager } from "./infra/DatabaseManager";
import { importImpl } from "./infra/ImporterManager";
import { GlobalRequestManager } from "./infra/RequestManager";
import { GlobalSessionManager } from "./infra/SessionManager";
import { LoggerManager } from "./infra/LoggerManager";
import { UsageManager } from "./infra/UsageManager";
import { TraceManager } from "./infra/TraceManager";
import { FeatureManager } from "./infra/FeatureManager";

export function loadInfra(): void {
    /* istanbul ignore if */
    if ((global as any).TIANYU) {
        return;
    }

    const requestMgr = new GlobalRequestManager();
    const sessionMgr = new GlobalSessionManager();
    (global as any).TIANYU = generateInfra(sessionMgr, requestMgr);
}

export function generateInfra(sessionMgr: ISession, request: IServerRequest): IGlobalDefinition {
    const tianyu_infra: IGlobalDefinition = {
        db: new DatabaseManager(),
        fwk: {
            contributor: new ContributorManager(),
        },
        import: importImpl(),

        logger: new LoggerManager(),
        request: request,
        session: sessionMgr,
        usage: new UsageManager(),
        trace: new TraceManager(),
        feature: new FeatureManager(),

        environment: {
            baseUrl: PROJECT_ROOT_PATH,
            version: PROJECT_VERSION,
            development: PROJECT_ENVIRONMENT_MODE.toLowerCase() === "development",
            name: PROJECT_NAME,
        },
    };

    return tianyu_infra;
}

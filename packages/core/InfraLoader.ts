/** @format */

import { IContributor, Contributor } from "@aitianyu.cn/tianyu-app-fwk";
import { ICSPContributorFactorProtocolMap, IGlobalDefinition, IServerRequest, ISession } from "#interface";
import { DatabaseManager } from "./infra/DatabaseManager";
import { importImpl } from "./infra/ImporterManager";
import { GlobalRequestManager } from "./infra/RequestManager";
import { GlobalSessionManager } from "./infra/SessionManager";
import { LoggerManager } from "./infra/LoggerManager";
import { UsageManager } from "./infra/UsageManager";
import { TraceManager } from "./infra/TraceManager";
import { FeatureManager } from "./infra/FeatureManager";
import { EnvironmentManager } from "./infra/EnvironmentManager";

/** To init infra of global scope */
export function loadInfra(): void {
    /* istanbul ignore if */
    if ((global as any).TIANYU) {
        return;
    }

    const requestMgr = new GlobalRequestManager();
    const sessionMgr = new GlobalSessionManager();
    (global as any).TIANYU = generateInfra(sessionMgr, requestMgr);
}

/** to create a default contributor */
export function createContributor(): IContributor<ICSPContributorFactorProtocolMap> {
    return new Contributor.Object<ICSPContributorFactorProtocolMap>();
}

/**
 * To generate an infra for job worker
 *
 * @param sessionMgr session manager instance
 * @param request request instance
 * @returns return a global definition
 */
export function generateInfra(sessionMgr: ISession, request: IServerRequest): IGlobalDefinition {
    const tianyu_infra: IGlobalDefinition = {
        db: new DatabaseManager(),
        fwk: {},
        import: importImpl(),

        logger: new LoggerManager(),
        request: request,
        session: sessionMgr,
        usage: new UsageManager(),
        trace: new TraceManager(),
        feature: new FeatureManager(),
        environment: new EnvironmentManager(),
    };

    return tianyu_infra;
}

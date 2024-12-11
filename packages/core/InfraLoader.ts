/** @format */

import { IGlobalDefinition, RequestPayloadData } from "#interface";
import { DATABASE_CONFIGS_MAP, DATABASE_TYPES_MAP, PROJECT_ROOT_PATH } from "packages/Common";
import { ContributorManager } from "./infra/ContributorManager";
import { DatabaseManager } from "./infra/DatabaseManager";
import { importImpl } from "./infra/ImporterManager";
import { GenericRequestManager, GlobalRequestManager } from "./infra/RequestManager";

export function loadInfra(): void {
    if ((global as any).TIANYU) {
        return;
    }

    (global as any).TIANYU = generateInfra();
}

export function generateInfra(request?: RequestPayloadData): IGlobalDefinition {
    const tianyu_infra: IGlobalDefinition = {
        db: new DatabaseManager({
            dbTypes: DATABASE_TYPES_MAP,
            configMap: DATABASE_CONFIGS_MAP,
        }),
        import: importImpl,
        fwk: {
            contributor: new ContributorManager(),
        },
        request: request ? new GenericRequestManager(request) : new GlobalRequestManager(),
        environment: {
            baseUrl: PROJECT_ROOT_PATH,
        },
    };

    return tianyu_infra;
}

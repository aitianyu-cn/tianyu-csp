/** @format */

import { IDatabaseInstallConfig, SupportedDatabaseType } from "#interface";
import { Log, MapOfType } from "@aitianyu.cn/types";
import { ConfigProcessor } from "./db/config-processor";
import { mysqlCreator } from "./db/mysql/mysql-installer";
import { DatabaseCreator } from "./db/database-processor";

/* istanbul ignore next */
export async function createDatabases(): Promise<boolean> {
    const config = ConfigProcessor.fromConfig();
    return handleConfig(config);
}

export async function handleConfig(config: MapOfType<IDatabaseInstallConfig>): Promise<boolean> {
    for (const dbType of Object.keys(config)) {
        const installer = getInstaller(dbType as any);
        if (!installer) {
            Log.error(`Database Type "${dbType}" currently not supported.`);
            return false;
        }

        const status = await installer(config[dbType]);
        if (!status) {
            return false;
        }
    }

    return true;
}

function getInstaller(type: SupportedDatabaseType): ((config: IDatabaseInstallConfig) => Promise<boolean>) | null {
    return DatabaseCreator[type]?.creator || null;
}

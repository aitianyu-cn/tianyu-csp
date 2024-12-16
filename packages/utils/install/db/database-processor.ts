/** @format */

import { IDatabaseInstallConfig, SupportedDatabaseType } from "#interface";
import { ConfigProcessor } from "./config-processor";
import { mysqlCreator } from "./mysql/mysql-installer";

export const DatabaseCreator: {
    [key in SupportedDatabaseType]: {
        creator: (config: IDatabaseInstallConfig) => Promise<boolean>;
    };
} = {
    mysql: {
        creator: mysqlCreator,
    },
};

export const configProcessor = ConfigProcessor.process;

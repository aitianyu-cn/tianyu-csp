/** @format */

import { IDatabaseInstallConfig, SupportedDatabaseType } from "#interface";
import { ConfigProcessor } from "./config-processor";
import { DataProcessor } from "./data-processor";
import { mysqlCleaner, mysqlCreator, mysqlDestroyer, mysqlInserter } from "./mysql/mysql-installer";

export const DatabaseProcessor: {
    [key in SupportedDatabaseType]: {
        creator: (config: IDatabaseInstallConfig, destroy?: boolean) => Promise<boolean>;
        destroyer: (config: IDatabaseInstallConfig) => Promise<boolean>;
        cleaner: (config: IDatabaseInstallConfig) => Promise<boolean>;
        inserter: (config: IDatabaseInstallConfig) => Promise<boolean>;
    };
} = {
    mysql: {
        creator: mysqlCreator,
        destroyer: mysqlDestroyer,
        cleaner: mysqlCleaner,
        inserter: mysqlInserter,
    },
};

export const configProcessor = ConfigProcessor.process;
export const dataProcessor = DataProcessor.process;

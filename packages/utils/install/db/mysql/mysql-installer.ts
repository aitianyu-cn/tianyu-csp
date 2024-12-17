/** @format */

import { MysqlService } from "#core/infra/db/MysqlService";
import { IDatabaseInstallConfig } from "#interface";
import { handleSchema, handleSchemaDrop, handleSchemaClean, handleSchemaInsert } from "./handler";

export async function mysqlCreator(config: IDatabaseInstallConfig, destroy?: boolean): Promise<boolean> {
    for (const db of Object.keys(config)) {
        const databaseConfig = config[db];

        const connection = new MysqlService(db, databaseConfig.config);
        const schemaStatus = await handleSchema(connection, db, databaseConfig.tables, destroy);
        connection.close();

        if (!schemaStatus) {
            return false;
        }
    }

    return true;
}

export async function mysqlDestroyer(config: IDatabaseInstallConfig): Promise<boolean> {
    for (const db of Object.keys(config)) {
        const databaseConfig = config[db];

        const connection = new MysqlService(db, databaseConfig.config);
        const schemaStatus = await handleSchemaDrop(connection, db);
        connection.close();

        if (!schemaStatus) {
            return false;
        }
    }

    return true;
}

export async function mysqlCleaner(config: IDatabaseInstallConfig): Promise<boolean> {
    for (const db of Object.keys(config)) {
        const databaseConfig = config[db];

        const connection = new MysqlService(db, databaseConfig.config);
        const schemaStatus = await handleSchemaClean(connection, db, databaseConfig.tables);
        connection.close();

        if (!schemaStatus) {
            return false;
        }
    }

    return true;
}

export async function mysqlInserter(config: IDatabaseInstallConfig): Promise<boolean> {
    for (const db of Object.keys(config)) {
        const databaseConfig = config[db];

        const connection = new MysqlService(db, databaseConfig.config);
        const schemaStatus = await handleSchemaInsert(connection, db, databaseConfig.tables);
        connection.close();

        if (!schemaStatus) {
            return false;
        }
    }

    return true;
}

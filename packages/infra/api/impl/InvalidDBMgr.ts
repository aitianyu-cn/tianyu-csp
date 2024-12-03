/** @format */

import {
    DatabaseDefaultTableMap,
    DefaultTableId,
    IDatabaseAPIBase,
    IDatabaseManager,
    SupportedDatabaseType,
} from "../interface/Database";

export class InvalidDBMgr implements IDatabaseManager {
    public get isValid(): boolean {
        return false;
    }
    public databaseType(_databaseName: string): SupportedDatabaseType {
        return "mysql";
    }
    public connect(_databaseName: string): IDatabaseAPIBase {
        throw new Error("Method not implemented.");
    }
    public mappingTable(_tableId: DefaultTableId): DatabaseDefaultTableMap & { tableMapping: string } {
        throw new Error("Method not implemented.");
    }
}

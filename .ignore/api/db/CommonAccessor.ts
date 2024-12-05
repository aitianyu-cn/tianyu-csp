/** @format */

import { StringHelper } from "@aitianyu.cn/types";
import { GENERAL_OPERATION_ERROR_CODE, INFRA_DEFAULT_PRIVILEGE_LIST } from "../Constant";
import { DefaultTableId } from "../interface/Database";
import { OperationFailed } from "../interface/Declars";
import { IRuntimeManager } from "../interface/RuntimeMgr";
import { GlobalTemplateSQL } from "./sql/GlobalSql";
import { FilterHelper } from "../utils/FilterHelper";

const PRIVILEGE_TABLE_ID_MAP: {
    [key in DefaultTableId]: string;
} = {
    feature: INFRA_DEFAULT_PRIVILEGE_LIST.FEATURE.key,
    trace: INFRA_DEFAULT_PRIVILEGE_LIST.TRACE.key,
    usage: INFRA_DEFAULT_PRIVILEGE_LIST.USAGE.key,
    logger: INFRA_DEFAULT_PRIVILEGE_LIST.LOGGER.key,
    role: INFRA_DEFAULT_PRIVILEGE_LIST.AUTHORIZATION.ROLE.key,
    user: INFRA_DEFAULT_PRIVILEGE_LIST.AUTHORIZATION.USER.key,
    team: INFRA_DEFAULT_PRIVILEGE_LIST.AUTHORIZATION.TEAM.key,
    licenses: INFRA_DEFAULT_PRIVILEGE_LIST.AUTHORIZATION.LICENSES.key,
};

export async function clearDBTable(runtime: IRuntimeManager, tableId: DefaultTableId): Promise<void> {
    const { dbName, tableMapping } = runtime.db.mappingTable(tableId);
    const { user } = runtime.session.getInfo();

    const adminMode = user.admin;
    const privilege = adminMode || runtime.session.checkPrivilege(PRIVILEGE_TABLE_ID_MAP[tableId], "Delete");
    if (!privilege) {
        return Promise.reject({
            code: GENERAL_OPERATION_ERROR_CODE.OPERATION_NO_PRIVILEGE,
            message: `Operation: 'Clear ${PRIVILEGE_TABLE_ID_MAP[tableId]}' is not permitted for user '${user.name}', please check privilege of this user or apply the author from who has this privilege.`,
            error: `Clear ${PRIVILEGE_TABLE_ID_MAP[tableId]}`,
        } as OperationFailed);
    }

    const sql = StringHelper.format(GlobalTemplateSQL[adminMode ? "clear" : "delete"][runtime.db.databaseType(dbName)], [
        dbName,
        tableMapping,
        user.id,
    ]);

    const connection = runtime.db.connect(dbName);
    return connection.executeAsync(dbName, sql, true);
}

export async function executeDBCustom(
    runtime: IRuntimeManager,
    sqlTemp: string,
    sqlArgs: string[],
    tableId: DefaultTableId,
    bypassPrivilege: boolean = false,
): Promise<any> {
    const { dbName, tableMapping } = runtime.db.mappingTable("usage");
    const { user } = runtime.session.getInfo();

    const adminMode = user.admin;
    const privilege = bypassPrivilege || adminMode || runtime.session.checkPrivilege(PRIVILEGE_TABLE_ID_MAP[tableId], "Read");
    if (!privilege) {
        return Promise.reject({
            code: GENERAL_OPERATION_ERROR_CODE.OPERATION_NO_PRIVILEGE,
            message: `Operation: 'Read ${PRIVILEGE_TABLE_ID_MAP[tableId]}' is not permitted for user '${user.name}', please check privilege of this user or apply the author from who has this privilege.`,
            error: `Read ${PRIVILEGE_TABLE_ID_MAP[tableId]}`,
        } as OperationFailed);
    }

    const sql = StringHelper.format(sqlTemp, [dbName, tableMapping, ...sqlArgs]);

    const connection = runtime.db.connect(dbName);
    return connection.executeAsync(dbName, sql, true);
}

export async function batchDBCustom(
    runtime: IRuntimeManager,
    sql: string[],
    tableId: DefaultTableId,
    bypassPrivilege: boolean = false,
): Promise<any> {
    const { dbName } = runtime.db.mappingTable("usage");
    const { user } = runtime.session.getInfo();

    const adminMode = user.admin;
    const privilege = bypassPrivilege || adminMode || runtime.session.checkPrivilege(PRIVILEGE_TABLE_ID_MAP[tableId], "Read");
    if (!privilege) {
        return Promise.reject({
            code: GENERAL_OPERATION_ERROR_CODE.OPERATION_NO_PRIVILEGE,
            message: `Operation: 'Read ${PRIVILEGE_TABLE_ID_MAP[tableId]}' is not permitted for user '${user.name}', please check privilege of this user or apply the author from who has this privilege.`,
            error: `Read ${PRIVILEGE_TABLE_ID_MAP[tableId]}`,
        } as OperationFailed);
    }

    const connection = runtime.db.connect(dbName);
    return connection.executeBatchAsync(dbName, sql, true);
}

export async function selectDBCount(runtime: IRuntimeManager, tableId: DefaultTableId, condition: string): Promise<number> {
    const { dbName, tableMapping } = runtime.db.mappingTable(tableId);
    const { user } = runtime.session.getInfo();

    const adminMode = user.admin;
    const privilege = adminMode || runtime.session.checkPrivilege(PRIVILEGE_TABLE_ID_MAP[tableId], "Read");
    if (!privilege) {
        return Promise.reject({
            code: GENERAL_OPERATION_ERROR_CODE.OPERATION_NO_PRIVILEGE,
            message: `Operation: 'Read ${PRIVILEGE_TABLE_ID_MAP[tableId]}' is not permitted for user '${user.name}', please check privilege of this user or apply the author from who has this privilege.`,
            error: `Read ${PRIVILEGE_TABLE_ID_MAP[tableId]}`,
        } as OperationFailed);
    }

    const sql = StringHelper.format(GlobalTemplateSQL["count"][runtime.db.databaseType(dbName)], [
        dbName,
        tableMapping,
        condition,
    ]);

    const connection = runtime.db.connect(dbName);
    return connection.executeAsync(dbName, sql, true).then(
        async (result) => {
            const count = Array.isArray(result) && result.length ? result[0]["count"] || 0 : 0;
            return Promise.resolve(count);
        },
        async (error) => Promise.reject(error),
    );
}

export async function pushDBRecord(
    runtime: IRuntimeManager,
    sqlTemp: string,
    sqlArgs: string[],
    tableId: DefaultTableId,
): Promise<void> {
    const { dbName, tableMapping } = runtime.db.mappingTable(tableId);

    const sql = StringHelper.format(sqlTemp, [dbName, tableMapping, ...sqlArgs]);

    const connection = runtime.db.connect(dbName);
    return connection.executeAsync(dbName, sql, true);
}

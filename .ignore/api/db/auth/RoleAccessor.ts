/** @format */
/** @format */

import { RolePrivilegeMap } from "#infra/api/interface/Authorize";
import { IRuntimeManager } from "#infra/api/interface/RuntimeMgr";
import { MapOfType, StringHelper } from "@aitianyu.cn/types";
import { executeDBCustom, batchDBCustom } from "../CommonAccessor";
import { OperationActions, RecordsResult, RolePrivilegeType } from "#infra/api/interface/Declars";
import { FilterHelper } from "#infra/api/utils/FilterHelper";

const TemplateSQL: any = {
    allRole: {
        mysql: "SELECT `name`, `read`, `write`, `delete`, `change`, `execute` FROM `{0}`.`{1}` WHERE `lid` = '{4}' AND {5} LIMIT {2} OFFSET {3};",
    },
    roleCount: {
        mysql: "SELECT COUNT(*) AS `count` FROM `{0}`.`{1}` WHERE `lid` = {2} AND {3};",
    },
    addRole: {
        mysql: "INSERT INTO `{0}`.`{1}` (`lid`, `name`, `read`, `write`, `delete`, `change`, `execute`) VALUES ('{2}', '{3}', {4}, {5}, {6}, {7}, {8});",
    },
    changeRole: {
        mysql: "UPDATE `{0}`.`{1}` SET `{2}` = {3} WHERE `lid` = '{4}' AND `name` = '{5}';",
    },
};

//==============================================================
// Role Part
//==============================================================

async function selectRolesCount(runtime: IRuntimeManager, licenses: string): Promise<number> {
    return searchRolesCount(
        runtime,
        licenses,
        FilterHelper.format(runtime, undefined, {
            bypassUser: true,
        }),
    );
}

async function selectAllRoleOfLicenses(
    runtime: IRuntimeManager,
    licenses: string,
    start: number,
    count: number,
): RecordsResult<MapOfType<RolePrivilegeMap>> {
    return searchAllRoleOfLicenses(
        runtime,
        licenses,
        start,
        count,
        FilterHelper.format(runtime, undefined, {
            bypassUser: true,
        }),
    );
}

async function addRole(runtime: IRuntimeManager, licenses: string, roles: MapOfType<RolePrivilegeMap>): Promise<void> {
    const { dbName, tableMapping } = runtime.db.mappingTable("role");

    const sqls: string[] = [];
    for (const role of Object.keys(roles)) {
        const privilege = roles[role];
        sqls.push(
            StringHelper.format(TemplateSQL["addRole"][runtime.db.databaseType(dbName)], [
                dbName,
                tableMapping,
                licenses,
                role,
                privilege.Read,
                privilege.Write,
                privilege.Delete,
                privilege.Change,
                privilege.Execute,
            ]),
        );
    }

    return batchDBCustom(runtime, sqls, "role");
}

async function changeRole(
    runtime: IRuntimeManager,
    licenses: string,
    deltas: { name: string; action: OperationActions; privilege: RolePrivilegeType }[],
): Promise<void> {
    const { dbName, tableMapping } = runtime.db.mappingTable("role");

    const sqls: string[] = [];
    for (const item of deltas) {
        sqls.push(
            StringHelper.format(TemplateSQL["changeRole"][runtime.db.databaseType(dbName)], [
                dbName,
                tableMapping,
                item.action.toLocaleLowerCase(),
                item.privilege,
                licenses,
                item.name,
            ]),
        );
    }

    return batchDBCustom(runtime, sqls, "role");
}

async function searchRolesCount(runtime: IRuntimeManager, licenses: string, filter: string): Promise<number> {
    const { dbName } = runtime.db.mappingTable("role");

    return executeDBCustom(runtime, TemplateSQL["roleCount"][runtime.db.databaseType(dbName)], [licenses, filter], "role").then(
        async (result: any) => {
            const count = Array.isArray(result) && result.length ? result[0]["count"] || 0 : 0;
            return Promise.resolve(count);
        },
        async (error) => Promise.reject(error),
    );
}

async function searchAllRoleOfLicenses(
    runtime: IRuntimeManager,
    licenses: string,
    start: number,
    count: number,
    filter: string,
): RecordsResult<MapOfType<RolePrivilegeMap>> {
    const { dbName } = runtime.db.mappingTable("role");

    return executeDBCustom(
        runtime,
        TemplateSQL["allRole"][runtime.db.databaseType(dbName)],
        [count.toString(), start.toString(), licenses, filter],
        "role",
    ).then(
        async (result: any) => {
            const records: MapOfType<RolePrivilegeMap> = {};
            if (Array.isArray(result) && result.length) {
                for (const item of result) {
                    records[item["name"]] = {
                        Read: item["read"] as RolePrivilegeType,
                        Write: item["write"] as RolePrivilegeType,
                        Delete: item["delete"] as RolePrivilegeType,
                        Change: item["change"] as RolePrivilegeType,
                        Execute: item["execute"] as RolePrivilegeType,
                    };
                }
            }

            return Promise.resolve({ records, start, end: start + count - 1 });
        },
        async (error) => Promise.reject(error),
    );
}

export {
    selectRolesCount as count,
    selectAllRoleOfLicenses as getRoles,
    addRole as add,
    changeRole as change,
    searchRolesCount as getSearchCount,
    searchAllRoleOfLicenses as getSearchRoles,
};

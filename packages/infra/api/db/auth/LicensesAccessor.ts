/** @format */

import { ILicensesDBRecord, RolePrivilegeMap } from "#infra/api/interface/Authorize";
import { IRuntimeManager } from "#infra/api/interface/RuntimeMgr";
import { getBoolean, MapOfType, StringHelper } from "@aitianyu.cn/types";
import { selectDBCount, executeDBCustom, selectDBRecords, batchDBCustom } from "../CommonAccessor";
import { OperationActions, RolePrivilegeType } from "#infra/api/interface/Declars";

const TemplateSQL: any = {
    allLicenses: {
        mysql: "SELECT `id`, `name`, `desc`, `sys` FROM `{0}`.`{1}` LIMIT {2} OFFSET {3};",
    },
    addLicenses: {
        mysql: "INSERT INTO `{0}`.`{1}` (`id`, `name`, `desc`, `sys`) VALUES ('{2}', '{3}', '{4}', {5});",
    },

    allRole: {
        mysql: "SELECT `name`, `read`, `write`, `delete`, `change`, `execute` FROM `{0}`.`{1}` WHERE `lid` = '{2}'  LIMIT {3} OFFSET {4};",
    },
    roleCount: {
        mysql: "SELECT COUNT(*) AS `count` FROM `{0}`.`{1}` WHERE `lid` = {2};",
    },
    addRole: {
        mysql: "INSERT INTO `{0}`.`{1}` (`lid`, `name`, `read`, `write`, `delete`, `change`, `execute`) VALUES ('{2}', '{3}', {4}, {5}, {6}, {7}, {8});",
    },
    changeRole: {
        mysql: "UPDATE `{0}`.`{1}` SET `{2}` = {3} WHERE `lid` = '{4}' AND `name` = '{5}';",
    },
};

//==============================================================
// Licenses Part
//==============================================================

export async function selectLicensesCount(runtime: IRuntimeManager): Promise<number> {
    return selectDBCount(runtime, "licenses");
}

export async function selectAllLicenses(runtime: IRuntimeManager, start: number, count: number): Promise<ILicensesDBRecord[]> {
    const { dbName } = runtime.db.mappingTable("licenses");

    return selectDBRecords(runtime, TemplateSQL["allLicenses"][runtime.db.databaseType(dbName)], start, count, "licenses").then(
        async (result: any) => {
            const records: ILicensesDBRecord[] = [];
            if (Array.isArray(result) && result.length) {
                for (const item of result) {
                    records.push({
                        id: item["id"],
                        name: item["name"],
                        desc: item["desc"],
                        sys: getBoolean(item["sys"]),
                    });
                }
            }

            return Promise.resolve(records);
        },
        async (error) => Promise.reject(error),
    );
}

export async function addLicenses(runtime: IRuntimeManager, record: ILicensesDBRecord): Promise<void> {
    const { dbName } = runtime.db.mappingTable("licenses");

    return executeDBCustom(
        runtime,
        TemplateSQL["addLicenses"][runtime.db.databaseType(dbName)],
        [record.id, record.name, record.desc, record.sys ? "1" : "0"],
        "licenses",
    ).then(
        async () => Promise.resolve(),
        async (error) => Promise.reject(error),
    );
}

//==============================================================
// Role Part
//==============================================================

export async function selectRolesCount(runtime: IRuntimeManager, licenses: string): Promise<number> {
    const { dbName } = runtime.db.mappingTable("role");

    return executeDBCustom(runtime, TemplateSQL["roleCount"][runtime.db.databaseType(dbName)], [licenses], "role").then(
        async (result: any) => {
            const count = Array.isArray(result) && result.length ? result[0]["count"] || 0 : 0;
            return Promise.resolve(count);
        },
        async (error) => Promise.reject(error),
    );
}

export async function selectAllRoleOfLicenses(
    runtime: IRuntimeManager,
    licenses: string,
    start: number,
    count: number,
): Promise<MapOfType<RolePrivilegeMap>> {
    const { dbName } = runtime.db.mappingTable("role");

    return executeDBCustom(
        runtime,
        TemplateSQL["allRole"][runtime.db.databaseType(dbName)],
        [licenses, count.toString(), start.toString()],
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

            return Promise.resolve(records);
        },
        async (error) => Promise.reject(error),
    );
}

export async function addRole(runtime: IRuntimeManager, licenses: string, roles: MapOfType<RolePrivilegeMap>): Promise<void> {
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

export async function changeRole(
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

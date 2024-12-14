/** @format */

import { IUserDBRecord } from "#infra/api/interface/Authorize";
import { RecordsResult, ResultsetValidState } from "#infra/api/interface/Declars";
import { IRuntimeManager } from "#infra/api/interface/RuntimeMgr";
import { FilterHelper } from "#infra/api/utils/FilterHelper";
import { executeDBCustom, selectDBCount } from "../CommonAccessor";

const TemplateSQL: any = {
    all: {
        mysql: "SELECT `id`, `email`, `name`, `license`, `team` FROM `{0}`.`{1}` LIMIT {2} OFFSET {3} WHERE {4};",
    },

    validate: {
        mysql: "SELECT `id`, `email`, `name`, `license`, `team` FROM `{0}`.`{1}` WHERE (`name` = '{2}' OR `email` = '{2}') AND `skey` = '{3}';",
    },

    add: {
        mysql: "INSERT INTO `{0}`.`{1}` (`id`, `email`, `skey`, `name`, `license`, `team`) VALUES ('{2}', '{3}', '{4}', '{5}', '{6}', '{7}');",
    },
    remove: {
        mysql: "DELETE FROM `{0}`.`{1}` WHERE `id` = '{2}';",
    },

    change: {
        mysql: "UPDATE `{0}`.`{1}` SET `name` = '{2}', `license` = '{3}', `team` = '{4}' WHERE `id` = '{5}';",
    },
    changeSkey: {
        mysql: "UPDATE `{0}`.`{1}` SET `skey` = '{2}' WHERE `id` = '{3}';",
    },
};

async function searchAllUsersCount(runtime: IRuntimeManager, filter: string): Promise<number> {
    return selectDBCount(runtime, "user", filter);
}

async function searchAllUsers(
    runtime: IRuntimeManager,
    start: number,
    count: number,
    filter: string,
): RecordsResult<IUserDBRecord[]> {
    const { dbName } = runtime.db.mappingTable("user");

    return executeDBCustom(
        runtime,
        TemplateSQL["all"][runtime.db.databaseType(dbName)],
        [count.toString(), start.toString(), filter],
        "user",
    ).then(
        async (result) => {
            const records: IUserDBRecord[] = [];
            if (Array.isArray(result) && result.length) {
                for (const item of result) {
                    records.push({
                        id: item["id"],
                        name: item["name"],
                        email: item["email"],
                        license: item["license"],
                        team: item["team"] ? (item["team"] as string).split(",").map((value) => value.trim()) : [],
                    });
                }
            }

            return Promise.resolve({ records, start, end: start + count - 1 });
        },
        async (error) => Promise.reject(error),
    );
}

async function selectAllUsersCount(runtime: IRuntimeManager): Promise<number> {
    return searchAllUsersCount(
        runtime,
        FilterHelper.format(runtime, undefined, {
            bypassUser: true,
        }),
    );
}

async function selectAllUsers(runtime: IRuntimeManager, start: number, count: number): RecordsResult<IUserDBRecord[]> {
    return searchAllUsers(
        runtime,
        start,
        count,
        FilterHelper.format(runtime, undefined, {
            bypassUser: true,
        }),
    );
}

async function validateUser(runtime: IRuntimeManager, user: string, skey: string): Promise<IUserDBRecord & ResultsetValidState> {
    const { dbName } = runtime.db.mappingTable("user");

    return executeDBCustom(runtime, TemplateSQL["validate"][runtime.db.databaseType(dbName)], [user, skey], "user").then(
        async (result) => {
            const record: IUserDBRecord & ResultsetValidState =
                Array.isArray(result) && result.length
                    ? {
                          id: result[0]["id"],
                          name: result[0]["name"],
                          email: result[0]["email"],
                          license: result[0]["license"],
                          team: result[0]["team"] ? (result[0]["team"] as string).split(",").map((value) => value.trim()) : [],
                          valid: !!result[0]["id"],
                      }
                    : {
                          id: "",
                          name: "",
                          email: "",
                          license: "",
                          team: [],
                          valid: false,
                      };

            return Promise.resolve(record);
        },
        async (error) => Promise.reject(error),
    );
}

async function addUser(runtime: IRuntimeManager, user: IUserDBRecord & { skey: string }): Promise<void> {
    const { dbName } = runtime.db.mappingTable("user");

    return executeDBCustom(
        runtime,
        TemplateSQL["add"][runtime.db.databaseType(dbName)],
        [user.id, user.email, user.skey, user.name, user.license, user.team.join(",")],
        "user",
    ).then(
        async () => Promise.resolve(),
        async (error) => Promise.reject(error),
    );
}

async function removeUser(runtime: IRuntimeManager, userId: string): Promise<void> {
    const { dbName } = runtime.db.mappingTable("user");

    return executeDBCustom(runtime, TemplateSQL["remove"][runtime.db.databaseType(dbName)], [userId], "user").then(
        async () => Promise.resolve(),
        async (error) => Promise.reject(error),
    );
}

async function updateUserInfo(runtime: IRuntimeManager, user: IUserDBRecord): Promise<void> {
    const { dbName } = runtime.db.mappingTable("user");

    return executeDBCustom(
        runtime,
        TemplateSQL["change"][runtime.db.databaseType(dbName)],
        [user.name, user.license, user.team.join(","), user.id],
        "user",
    ).then(
        async () => Promise.resolve(),
        async (error) => Promise.reject(error),
    );
}

async function updateUserSkey(runtime: IRuntimeManager, userId: string, skey: string): Promise<void> {
    const { dbName } = runtime.db.mappingTable("user");

    return executeDBCustom(runtime, TemplateSQL["changeSkey"][runtime.db.databaseType(dbName)], [skey, userId], "user").then(
        async () => Promise.resolve(),
        async (error) => Promise.reject(error),
    );
}

export {
    searchAllUsersCount as getSearchCount,
    searchAllUsers as getSearchUsers,
    selectAllUsersCount as count,
    selectAllUsers as users,
    validateUser as validate,
    addUser as add,
    removeUser as remove,
    updateUserInfo as change,
    updateUserSkey as changeSkey,
};

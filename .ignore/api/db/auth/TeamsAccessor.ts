/** @format */

import { ITeamDBRecord } from "#infra/api/interface/Authorize";
import { RecordsResult } from "#infra/api/interface/Declars";
import { IRuntimeManager } from "#infra/api/interface/RuntimeMgr";
import { FilterHelper } from "#infra/api/utils/FilterHelper";
import { executeDBCustom, selectDBCount } from "../CommonAccessor";

const TemplateSQL: any = {
    all: {
        mysql: "SELECT `id`, `name`, `desc` FROM `{0}`.`{1}` WHERE {2};",
    },
    add: {
        mysql: "INSERT INTO `{0}`.`{1}` (`id`, `name`, `desc`) VALUES ('{2}', '{3}', '{4}');",
    },
    remove: {
        mysql: "DELETE FROM `{0}`.`{1}` WHERE `name` = '{2}';",
    },
};

async function selectTeamsCount(runtime: IRuntimeManager): Promise<number> {
    return searchTeamsCount(
        runtime,
        FilterHelper.format(runtime, undefined, {
            bypassUser: true,
        }),
    );
}

async function selectAllTeam(runtime: IRuntimeManager, start: number, count: number): RecordsResult<ITeamDBRecord[]> {
    return searchAllTeam(
        runtime,
        start,
        count,
        FilterHelper.format(runtime, undefined, {
            bypassUser: true,
        }),
    );
}

async function searchTeamsCount(runtime: IRuntimeManager, filter: string): Promise<number> {
    return selectDBCount(runtime, "team", filter);
}

async function searchAllTeam(
    runtime: IRuntimeManager,
    start: number,
    count: number,
    filter: string,
): RecordsResult<ITeamDBRecord[]> {
    const { dbName } = runtime.db.mappingTable("team");

    return executeDBCustom(
        runtime,
        TemplateSQL["all"][runtime.db.databaseType(dbName)],
        [count.toString(), start.toString(), filter],
        "team",
    ).then(
        async (result: any) => {
            const records: ITeamDBRecord[] = [];
            if (Array.isArray(result) && result.length) {
                for (const item of result) {
                    records.push({
                        id: item["id"],
                        name: item["name"],
                        desc: item["desc"],
                    });
                }
            }

            return Promise.resolve({ records, start, end: start + count - 1 });
        },
        async (error) => Promise.reject(error),
    );
}

async function addTeam(runtime: IRuntimeManager, team: ITeamDBRecord): Promise<void> {
    const { dbName } = runtime.db.mappingTable("team");

    return executeDBCustom(
        runtime,
        TemplateSQL["add"][runtime.db.databaseType(dbName)],
        [team.id, team.name, team.desc],
        "team",
    ).then(
        async () => Promise.resolve(),
        async (error) => Promise.reject(error),
    );
}

async function removeTeam(runtime: IRuntimeManager, name: string): Promise<void> {
    const { dbName } = runtime.db.mappingTable("team");

    return executeDBCustom(runtime, TemplateSQL["remove"][runtime.db.databaseType(dbName)], [name], "team").then(
        async () => Promise.resolve(),
        async (error) => Promise.reject(error),
    );
}

export {
    selectTeamsCount as count,
    selectAllTeam as allTeams,
    searchTeamsCount as getSearchCount,
    searchAllTeam as getSearchTeams,
    addTeam as add,
    removeTeam as remove,
};

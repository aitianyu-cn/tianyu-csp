/** @format */

import { ITeamDBRecord } from "#infra/api/interface/Authorize";
import { IRuntimeManager } from "#infra/api/interface/RuntimeMgr";
import { executeDBCustom, selectDBCount, selectDBRecords } from "../CommonAccessor";

const TemplateSQL: any = {
    all: {
        mysql: "SELECT `id`, `name`, `desc` FROM `{0}`.`{1}`;",
    },
    add: {
        mysql: "INSERT INTO `{0}`.`{1}` (`id`, `name`, `desc`) VALUES ('{2}', '{3}', '{4}');",
    },
    remove: {
        mysql: "DELETE FROM `{0}`.`{1}` WHERE `name` = '{2}';",
    },
};

export async function selectTeamsCount(runtime: IRuntimeManager): Promise<number> {
    return selectDBCount(runtime, "team");
}

export async function selectAllTeam(runtime: IRuntimeManager, start: number, count: number): Promise<ITeamDBRecord[]> {
    const { dbName } = runtime.db.mappingTable("team");

    return selectDBRecords(runtime, TemplateSQL["all"][runtime.db.databaseType(dbName)], start, count, "team").then(
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

            return Promise.resolve(records);
        },
        async (error) => Promise.reject(error),
    );
}

export async function addTeam(runtime: IRuntimeManager, team: ITeamDBRecord): Promise<void> {
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

export async function removeTeam(runtime: IRuntimeManager, name: string): Promise<void> {
    const { dbName } = runtime.db.mappingTable("team");

    return executeDBCustom(runtime, TemplateSQL["remove"][runtime.db.databaseType(dbName)], [name], "team").then(
        async () => Promise.resolve(),
        async (error) => Promise.reject(error),
    );
}

/** @format */

import { AreaCode, KeyValuePair, LogLevel, MapOfString, parseAreaCode } from "@aitianyu.cn/types";
import fs from "fs";
import path from "path";
import { TRACE } from "../trace/Trace";
import { DirectoryMap, ProjectDefine } from "../Constant";
import { LogHelper } from "../utils/LogHelper";
import { TraceHelper } from "../utils/TraceHelper";
import { USAGE } from "../usage/Usage";

export class MessageLoader {
    private _cache: Map<string, Map<string, MapOfString>>;

    public constructor() {
        this._cache = new Map<string, Map<string, MapOfString>>();
    }

    public getMessageMap(project: ProjectDefine, language?: AreaCode, modulename?: string): MapOfString {
        const languageString = language ? parseAreaCode(language) : "";
        USAGE.record(project, "message", "Read", `${languageString || "default"} language map`);

        if (!project) {
            return {};
        }

        const cachedMap = this._cache.get(project)?.get(languageString || "default");
        if (cachedMap) {
            return cachedMap;
        }

        const projectMap = this._cache.get(project) || new Map<string, MapOfString>();
        if (!this._cache.has(project)) {
            this._cache.set(project, projectMap);
        }

        const fileName = languageString ? `message-${languageString}.json` : "message.json";
        const file = fs.readFileSync(
            path.resolve(DirectoryMap.INFRA_RESOURCES, "message", project, modulename || "", fileName),
            "utf-8",
        );

        try {
            const readMap = Object.freeze(JSON.parse(file));
            projectMap.set(languageString || "default", readMap);

            TRACE.logAndTrace(
                LogHelper.generateMsg(project, "message.MessageLoader", `Read language file ${file} done.`),
                LogLevel.DEBUG,
            );

            return readMap;
        } catch (e: any) {
            TRACE.logAndTrace(
                LogHelper.generateMsg(project, "message.MessageLoader", `Read language file ${file} failed.`),
                LogLevel.ERROR,
                {
                    id: TraceHelper.generateTraceId(project, "message.MessageLoader"),
                    error: e.message,
                    area: "core",
                },
            );
            return {};
        }
    }
}

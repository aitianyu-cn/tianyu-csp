/** @format */

import { AreaCode, MapOfString, StringHelper } from "@aitianyu.cn/types";
import { MessageLoader } from "./MessageLoader";
import { ProjectDefine } from "../Constant";

const messageLoader = new MessageLoader();

function formatText(map: MapOfString, id: string, args?: (string | number)[] | string): string {
    const value = map[id] ? map[id].trim() : undefined;
    if (value && args) {
        return StringHelper.format(value, args);
    }
    return value || "";
}

export class MessageBundle {
    private _lang: AreaCode;
    private _project: ProjectDefine;
    private _module: string | undefined;

    public constructor(project: ProjectDefine, language: AreaCode, module?: string) {
        this._lang = language;
        this._project = project;
        this._module = module;
    }

    public getText(key: string, params?: (string | number)[] | string): string {
        const languageMap = this._getMsgMap();
        const formattedResource = formatText(languageMap, key, params);
        if (formattedResource) {
            try {
                // return unescape(encodeURI(formattedResource.replace(/\"/g, '\\"')));
                return unescape(JSON.parse(`"${formattedResource}"`));
            } catch {
                // When the value formating cause an error, to return the raw value instead.
            }
        }
        return formattedResource || "";
    }

    private _getMsgMap(): MapOfString {
        const languageMap = messageLoader.getMessageMap(this._project, this._lang, this._module);
        if (Object.keys(languageMap).length) {
            return languageMap;
        }

        const defaultMap = messageLoader.getMessageMap(this._project, undefined, this._module);
        return defaultMap;
    }
}

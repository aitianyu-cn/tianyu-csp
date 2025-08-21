/** @format */

import { AreaCode } from "@aitianyu.cn/types";
import { LocalMessageBundle } from "./LocalMessageBundle";

class InternalMessageBundle extends LocalMessageBundle {
    public constructor() {
        super(__dirname, ["i18n/default.json"]);
    }

    public text(key: string, ...args: (string | number)[]): string {
        return this.getText("i18n", key, ...args);
    }

    public areaText(key: string, area: AreaCode, ...args: (string | number)[]): string {
        return this.getAreaText("i18n", key, area, ...args);
    }

    /** @deprecated please use 'text' instead */
    public override getText(project: string, key: string, ...args: (string | number)[]): string {
        return super.getText(project, key, ...args);
    }
    /** @deprecated please use 'areaText' instead */
    public override getAreaText(project: string, key: string, area: AreaCode, ...args: (string | number)[]): string {
        return super.getAreaText(project, key, area, ...args);
    }
}

/** Default CSP Message handler */
export const MessageBundle: {
    /**
     * Get a string from key, and format the source string with given args.
     *
     * @param key key of the source string in the i18n file
     * @param args source string formatting args
     *
     * @returns return a formatted string based on args
     */
    text(key: string, ...args: (string | number)[]): string;
    /**
     * Get a string from key, and format the source string with given args.
     *
     * @param key key of the source string in the i18n file
     * @param area specified language type
     * @param args source string formatting args
     *
     * @returns return a formatted string based on args
     */
    areaText(key: string, area: AreaCode, ...args: (string | number)[]): string;
} = new InternalMessageBundle();

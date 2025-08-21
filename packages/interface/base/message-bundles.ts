/** @format */

import { AreaCode } from "@aitianyu.cn/types";

/** Message Bundle */
export interface IMessageBundle {
    /**
     * Get a string from specified project and key, and format the source string with given args.
     *
     * @param project project name of the source i18n file
     * @param key key of the source string in the i18n file
     * @param args source string formatting args
     *
     * @returns return a formatted string based on args
     */
    getText(project: string, key: string, ...args: (string | number)[]): string;
    /**
     * Get a string from specified project and key, and format the source string with given args.
     *
     * @param project project name of the source i18n file
     * @param key key of the source string in the i18n file
     * @param area specified language type
     * @param args source string formatting args
     *
     * @returns return a formatted string based on args
     */
    getAreaText(project: string, key: string, area: AreaCode, ...args: (string | number)[]): string;
}

// /** Message Bundle Global Cache Manager */
// export interface IMessageManager {
//     import(resource: string, type: "url" | "file"): Promise<void>;
// }

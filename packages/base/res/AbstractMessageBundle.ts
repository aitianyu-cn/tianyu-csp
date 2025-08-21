/** @format */

import { IMessageBundle } from "#interface";
import { AreaCode } from "@aitianyu.cn/types";

export abstract class AbstractMessageBundle implements IMessageBundle {
    public getText(project: string, key: string, ...args: (string | number)[]): string {
        const area =
            TIANYU.session.language === AreaCode.unknown
                ? /* istanbul ignore next */ TIANYU.session.defaultLanguage
                : TIANYU.session.language;
        return this.getTextWithArea(project, key, area, args);
    }

    public getAreaText(project: string, key: string, area: AreaCode, ...args: (string | number)[]): string {
        return this.getTextWithArea(project, key, area, args);
    }

    protected abstract getTextWithArea(project: string, key: string, area: AreaCode, args: (string | number)[]): string;
}

/** @format */

import fs from "fs";
import path from "path";
import { AbstractMessageBundle } from "./AbstractMessageBundle";
import { AreaCode, MapOfString, MapOfType, parseAreaCode, StringHelper } from "@aitianyu.cn/types";

/** Message Bundle for local cache */
export class LocalMessageBundle extends AbstractMessageBundle {
    private root: string;
    private cache: MapOfType<MapOfString>;

    private fileNameConverter: (project: string, area: AreaCode) => string;

    /**
     * Create a Local Message Bundle Instance
     *
     * @param root message bundle i18n files root path
     * @param init init loading files (this should be generated same as file parse generated)
     */
    public constructor(root: string, init?: string[]) {
        super();

        this.root = root;
        this.cache = {};
        this.fileNameConverter = LocalMessageBundle.DEFAULT_FILE_PARSER;

        for (const source of init || []) {
            source && this.load(source);
        }
    }

    protected getTextWithArea(project: string, key: string, area: AreaCode, args: (string | number)[]): string {
        const file = this.fileNameConverter(project, area);
        if (!this.cache[file]) {
            this.load(file);
        }

        const rawText =
            this.cache[file]?.[key] ||
            this.cache[this.fileNameConverter(project, TIANYU.session.language)]?.[key] ||
            /* istanbul ignore next */ this.cache[this.fileNameConverter(project, TIANYU.session.defaultLanguage)]?.[key] ||
            /* istanbul ignore next */ this.cache[this.fileNameConverter(project, AreaCode.unknown)]?.[key];
        return rawText ? StringHelper.format(rawText, args) : "";
    }

    private load(source: string): void {
        if (!source) {
            return;
        }

        const file = path.join(this.root, source);
        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
            this.cache[source] = require(file);
        } else {
            this.cache[source] = {};
        }
    }

    /**
     * Set a new file parser
     *
     * Please ensure the setting is call in file generation
     */
    public set fileParser(fn: (project: string, area: AreaCode) => string) {
        this.fileNameConverter = fn;
    }
    /** Get current used file parser */
    public get fileParser(): (project: string, area: AreaCode) => string {
        return this.fileNameConverter;
    }

    /** Local Message Bundle Default file parser */
    public static DEFAULT_FILE_PARSER = (project: string, area: AreaCode) =>
        `${project}/${area === AreaCode.unknown ? "default" : parseAreaCode(area)}.json`;
}

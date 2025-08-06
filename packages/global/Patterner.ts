/** @format */

import { IPattern } from "#interface";
import { MapOfType } from "@aitianyu.cn/types";

interface PatternNode {
    test: boolean;
    subpat: MapOfType<PatternNode>;
}

/**
 * Global used Pattern
 *
 * Support to test a given path is matched the pattern list
 */
export class Pattern implements IPattern {
    private patternMap: PatternNode;

    /**
     * Create an instance from given pattern string array
     *
     * @param pattern pattern string array
     */
    public constructor(pattern: string[]) {
        this.patternMap = { test: false, subpat: {} };

        this.process(pattern);
    }

    public test(str: string): boolean {
        const pathes = str.split("/").filter((value) => !!value);
        let node = this.patternMap;
        for (const path of pathes) {
            if (!node.subpat[path] || node.test) {
                break;
            }

            node = node.subpat[path];
        }

        return node.test;
    }

    private process(pattern: string[]): void {
        for (const p of pattern) {
            this.processPattern(p);
        }
    }
    private processPattern(pattern: string): void {
        const pathes = pattern.split("/").filter((value) => !!value);
        if (!pathes.length) {
            return;
        }

        let node = this.patternMap;
        for (const path of pathes) {
            if (!node.subpat[path]) {
                node.subpat[path] = { test: false, subpat: {} };
            }
            node = node.subpat[path];
        }

        node.test = true;
    }
}

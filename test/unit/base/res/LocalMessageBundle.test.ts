/** @format */

import { LocalMessageBundle } from "#base/res";
import { AreaCode } from "@aitianyu.cn/types";
import path from "path";

describe("aitianyu-cn.node-module.tianyu-csp.unit.base.object.LocalMessageBundle", () => {
    describe("default file converter", () => {
        const MessageBundle = new LocalMessageBundle(path.join(process.cwd(), "test/content/res/default"));

        it("getText in zh_CN", () => {
            expect(MessageBundle.getText("p1", "T1")).toEqual("project 1 text 1 zh-cn");
            expect(MessageBundle.getText("p2", "T1")).toEqual("project 2 text 1 zh-cn");
        });

        it("getAreaText in en_US", () => {
            expect(MessageBundle.getAreaText("p1", "T1", AreaCode.en_US)).toEqual("project 1 text 1 en-us");
            expect(MessageBundle.getAreaText("p2", "T1", AreaCode.en_US)).toEqual("project 2 text 1 en-us");
        });

        it("fileParser", () => {
            expect(MessageBundle.fileParser("a", AreaCode.zh_CN)).toEqual("a/zh_CN.json");
            expect(MessageBundle.fileParser("a", AreaCode.unknown)).toEqual("a/default.json");
        });
    });

    describe("custom file converter", () => {
        const MessageBundle = new LocalMessageBundle(path.join(process.cwd(), "test/content/res/custom"));
        MessageBundle.fileParser = (p: string, a: AreaCode) => {
            if (a === AreaCode.zh_CN) {
                return `${p}/zh.json`;
            }
            if (a === AreaCode.en_US) {
                return `${p}/en.json`;
            }
            return "";
        };

        it("getText in zh_CN", () => {
            expect(MessageBundle.getText("p1", "T1")).toEqual("project 1 text 1 zh-cn");
            expect(MessageBundle.getText("p2", "T1")).toEqual("project 2 text 1 zh-cn");
            expect(MessageBundle.getText("p3", "T1")).toEqual("");
        });

        it("getAreaText in en_US", () => {
            expect(MessageBundle.getAreaText("p1", "T1", AreaCode.en_US)).toEqual("project 1 text 1 en-us");
            expect(MessageBundle.getAreaText("p2", "T1", AreaCode.en_US)).toEqual("project 2 text 1 en-us");
            expect(MessageBundle.getAreaText("p2", "T1", AreaCode.unknown)).toEqual("project 2 text 1 zh-cn");
        });

        it("fileParser", () => {
            expect(MessageBundle.fileParser("a", AreaCode.zh_CN)).toEqual("a/zh.json");
            expect(MessageBundle.fileParser("a", AreaCode.unknown)).toEqual("");
        });
    });
});

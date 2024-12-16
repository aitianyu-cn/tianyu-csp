/** @format */

import { DBHelper } from "#utils/DBHelper";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.TraceHelper", () => {
    describe("encode", () => {
        it("empty string", () => {
            expect(DBHelper.encode("")).toEqual("");
        });

        it("-", () => {
            expect(DBHelper.encode("'\"`;")).toEqual("{s_q}{d_q}{b_q}{sem}");
            expect(DBHelper.encode("'1\"2`3;abc4'5\"6`7;")).toEqual("{s_q}1{d_q}2{b_q}3{sem}abc4{s_q}5{d_q}6{b_q}7{sem}");
        });
    });

    describe("decode", () => {
        it("empty string", () => {
            expect(DBHelper.decode("")).toEqual("");
        });

        it("-", () => {
            expect(DBHelper.decode(DBHelper.encode("'\"`;"))).toEqual("'\"`;");
            expect(DBHelper.decode(DBHelper.encode("'1\"2`3;abc4'5\"6`7;"))).toEqual("'1\"2`3;abc4'5\"6`7;");
        });
    });
});

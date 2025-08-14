/** @format */

import { StringObj } from "#base/object/String";

describe("aitianyu-cn.node-module.tianyu-csp.unit.base.object.StringObj", () => {
    it("stringify", () => {
        expect(StringObj.stringify(undefined)).toEqual("undefined");
        expect(() => {
            StringObj.stringify(() => undefined);
        }).toThrow();
        expect(StringObj.stringify("123")).toEqual("123");
        expect(StringObj.stringify(123)).toEqual("123");
        expect(StringObj.stringify(BigInt(123))).toEqual("123");
        expect(StringObj.stringify(Symbol("123"))).toEqual("Symbol(123)");
        expect(StringObj.stringify(true)).toEqual("true");
        expect(StringObj.stringify({ a: "123" })).toEqual(`{"a":"123"}`);
    });

    describe("stringifySafe", () => {
        let ERROR_SPY: jest.SpyInstance;

        beforeEach(() => {
            ERROR_SPY = jest.spyOn(TIANYU.audit, "error").mockImplementation(async () => Promise.resolve());
        });

        it("success", () => {
            expect(StringObj.stringifySafe({ a: "123" })).toEqual(`{"a":"123"}`);
            expect(ERROR_SPY).not.toHaveBeenCalled();
        });

        it("failed", () => {
            expect(StringObj.stringifySafe(() => undefined)).toEqual("");
            expect(ERROR_SPY).toHaveBeenCalled();
        });
    });
});

/** @format */

import { Json } from "#base/object/Json";

describe("aitianyu-cn.node-module.tianyu-csp.unit.base.object.Json", () => {
    it("parse", () => {
        expect(Json.parse(`{"a":"123"}`).a).toEqual("123");
        expect(() => {
            Json.parse("");
        }).toThrow();
    });

    describe("parseSafe", () => {
        let ERROR_SPY: jest.SpyInstance;

        beforeEach(() => {
            ERROR_SPY = jest.spyOn(TIANYU.audit, "error").mockImplementation(async () => Promise.resolve());
        });

        it("success", () => {
            expect(Json.parse(`{"a":"123"}`).a).toEqual("123");
            expect(ERROR_SPY).not.toHaveBeenCalled();
        });

        it("failed", () => {
            expect(Json.parseSafe("")).toEqual(null);
            expect(ERROR_SPY).toHaveBeenCalled();
        });
    });
});

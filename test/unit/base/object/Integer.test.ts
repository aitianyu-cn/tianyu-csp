/** @format */

import { Integer } from "#base/object/Integer";

describe("aitianyu-cn.node-module.tianyu-csp.unit.base.object.Integer", () => {
    it("random", () => {
        expect(Integer.random()).toBeGreaterThanOrEqual(0);

        const a = Integer.random(-1, -10);
        expect(a).toEqual(0);
    });

    it("toBytes", () => {
        const bytes = Integer.toBytes(6553526);
        expect(bytes[0]).toEqual(0);
        expect(bytes[1]).toEqual(0);
        expect(bytes[2]).toEqual(0);
        expect(bytes[3]).toEqual(0);
        expect(bytes[4]).toEqual(0);
        expect(bytes[5]).toEqual(0x63);
        expect(bytes[6]).toEqual(0xff);
        expect(bytes[7]).toEqual(0xb6);
    });

    it("left", () => {
        expect(Integer.left(10, 2)).toEqual(40);
        expect(Integer.left(10, 80)).toEqual(655360);
    });

    it("right", () => {
        expect(Integer.right(-123456789, 2)).toEqual(-30864198);
        expect(Integer.right(123456789, 80)).toEqual(1883);
    });

    it("rightUnsigned", () => {
        expect(Integer.rightUnsigned(-123456789, 2)).toEqual(1042877626);
        expect(Integer.rightUnsigned(123456789, 80)).toEqual(1883);
    });

    it("logic", () => {
        expect(Integer.or(0b1, 0b100, 0b11000)).toEqual(0b11101);
        expect(Integer.and(0b1, 0b1000, 0b11000)).toEqual(0);
        expect(Integer.xor(0b101, 0b111)).toEqual(0b10);
    });
});

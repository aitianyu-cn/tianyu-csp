/** @format */

import { DataView } from "#base/object/DataView";

describe("aitianyu-cn.node-module.tianyu-csp.unit.base.object.DataView", () => {
    describe("parse", () => {
        it("int8 array", () => {
            const data = Int8Array.from([1, 2, 3]);
            const view = DataView.parse(data);
            expect(view.byteLength).toEqual(3);
            expect(view.getInt8(0)).toEqual(1);
            expect(view.getInt8(1)).toEqual(2);
            expect(view.getInt8(2)).toEqual(3);
        });

        it("uint8 array", () => {
            const data = Uint8Array.from([1, 2, 3]);
            const view = DataView.parse(data);
            expect(view.byteLength).toEqual(3);
            expect(view.getUint8(0)).toEqual(1);
            expect(view.getUint8(1)).toEqual(2);
            expect(view.getUint8(2)).toEqual(3);
        });

        it("uint8 clamped array", () => {
            const data = Uint8ClampedArray.from([1, 2, 3]);
            const view = DataView.parse(data);
            expect(view.byteLength).toEqual(3);
            expect(view.getUint8(0)).toEqual(1);
            expect(view.getUint8(1)).toEqual(2);
            expect(view.getUint8(2)).toEqual(3);
        });

        it("array buffer", () => {
            const data = Buffer.alloc(3, Uint8Array.from([1, 2, 3]));
            const view = DataView.parse(data);
            expect(view.byteLength).toEqual(3);
            expect(view.getInt8(0)).toEqual(1);
            expect(view.getInt8(1)).toEqual(2);
            expect(view.getInt8(2)).toEqual(3);
        });

        it("error", () => {
            expect(() => {
                DataView.parse([1, 2, 3] as any);
            }).toThrow();
        });
    });
});

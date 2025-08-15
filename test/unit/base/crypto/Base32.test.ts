/** @format */

import { Base32 } from "#base/crypto";
import { Bytes } from "#base/object/Bytes";

describe("aitianyu-cn.node-module.tianyu-csp.unit.base.object.Base32", () => {
    it("encode", () => {
        expect(Base32.encode(Buffer.from("123456", "utf-8"), "RFC4648")).toEqual("GEZDGNBVGY======");
        expect(Base32.encode(Buffer.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", "utf-8"), "RFC4648")).toEqual(
            "IFBEGRCFIZDUQSKKJNGE2TSPKBIVEU2UKVLFOWCZLIZDGNBVGY3Q====",
        );
        expect(Base32.encode(Buffer.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", "utf-8"), "RFC4648-HEX")).toEqual(
            "85146H258P3KGIAA9D64QJIFA18L4KQKALB5EM2PB8P36D1L6ORG====",
        );
        expect(Base32.encode(Buffer.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", "utf-8"), "Crockford")).toEqual(
            "85146H258S3MGJAA9D64TKJFA18N4MTMANB5EP2SB8S36D1N6RVG",
        );
    });

    it("decode", () => {
        expect(Buffer.from(Base32.decode("GEZDGNBVGY======", "RFC4648")).toString("utf-8")).toEqual("123456");
        expect(
            Buffer.from(Base32.decode("IFBEGRCFIZDUQSKKJNGE2TSPKBIVEU2UKVLFOWCZLIZDGNBVGY3Q====", "RFC4648")).toString("utf-8"),
        ).toEqual("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567");
        expect(
            Buffer.from(Base32.decode("85146H258P3KGIAA9D64QJIFA18L4KQKALB5EM2PB8P36D1L6ORG====", "RFC4648-HEX")).toString(
                "utf-8",
            ),
        ).toEqual("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567");
        expect(
            Buffer.from(Base32.decode("85146H258S3MGJAA9D64TKJFA18N4MTMANB5EP2SB8S36D1N6RVG", "Crockford")).toString("utf-8"),
        ).toEqual("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567");
    });

    it("unknown alphabet", () => {
        expect(() => {
            expect(Base32.encode(Buffer.from("123456", "utf-8"), "" as any));
        }).toThrow();
        expect(() => {
            expect(Base32.decode("GEZDGNBVGY======", "" as any));
        }).toThrow();
    });

    it("random", () => {
        jest.spyOn(Bytes, "random").mockReturnValue(Buffer.from("123456", "utf-8"));
        expect(Base32.random(1)).toEqual("GEZDGNBVGY======");
    });
});

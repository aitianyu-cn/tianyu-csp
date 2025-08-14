/** @format */

import { RSA } from "#base/crypto";
import { DataView } from "#base/object/DataView";

describe("aitianyu-cn.node-module.tianyu-csp.unit.base.crypto.RSA", () => {
    it("test", () => {
        const { privateKey, publicKey } = RSA.new({
            modulusLength: 2048,
            publicKeyEncoding: { type: "pkcs1", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
        });

        const src = Buffer.from("hello world!", "utf-8");

        const privateCodes = RSA.encodepri(DataView.parse(src), privateKey);
        expect(RSA.decodepub(DataView.parse(privateCodes), publicKey).toString("utf-8")).toEqual("hello world!");

        const publicCodes = RSA.encodepub(DataView.parse(src), publicKey);
        expect(RSA.decodepri(DataView.parse(publicCodes), privateKey).toString("utf-8")).toEqual("hello world!");
    });
});

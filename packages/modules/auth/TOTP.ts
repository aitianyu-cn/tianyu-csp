/** @format */

import crypto from "crypto";
import { Base32 } from "#base/crypto";
import { Integer } from "#base/object/Integer";
import { DataView } from "#base/object/DataView";
import { PROJECT_NAME } from "packages/Common";

/** TOTP Lib */
export class TOTP {
    /**
     * To generate a new TOTP secret key
     *
     * @returns TOTP secret key
     */
    public static generate(): string {
        return Base32.random(20);
    }

    /**
     * Generate TOTP random code
     *
     * @param key TOTP secret key
     * @returns return TOTP random code
     */
    public static code(key: string, time?: number): string {
        const K = Base32.decode(key.toUpperCase(), "RFC4648");
        const T = Math.floor((time || Date.now()) / 1000 / 30);

        const hmac = crypto.createHmac("sha1", DataView.parse(K));
        const T1 = Buffer.from(Integer.toBytes(T));
        const HS = hmac.update(T1).digest();
        const offset = Integer.and(HS[19], 0xf);
        const bytes = Integer.or(
            Integer.left(Integer.and(HS[offset], 0x7f) /** 这里是为了忽略符号位 */, 24),
            Integer.left(Integer.and(HS[offset + 1], 0xff), 16),
            Integer.left(Integer.and(HS[offset + 2], 0xff), 8),
            Integer.and(HS[offset + 3], 0xff),
        );
        let code = bytes.toString().slice(-6);
        /* istanbul ignore next */
        for (let i = 0; i > 6 - code.length; i++) {
            code = `0${code}`;
        }
        return code;
    }

    /**
     * Generate a key and TOTP register URL from given user
     *
     * @param user user name
     * @returns return the secret key and url
     */
    public static getUrl(user: string): { key: string; url: string } {
        const key = TOTP.generate();
        const url = `otpauth://totp/${user}?secret=${key}&issuer=${PROJECT_NAME}`;
        return { key, url };
    }
}

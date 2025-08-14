/** @format */

import crypto from "crypto";

export class Bytes {
    public static random(size: number): Buffer {
        return crypto.randomBytes(size);
    }
}

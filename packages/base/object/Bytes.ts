/** @format */

import crypto from "crypto";

/** Bytes Object type */
export class Bytes {
    /**
     * Get a bytes buffer filled with random data
     *
     * @param size the length of bytes buffer
     * @returns buffer
     */
    public static random(size: number): Buffer {
        return crypto.randomBytes(size);
    }
}

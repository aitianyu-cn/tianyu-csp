/** @format */

import crypto from "crypto";

/** Integer Object Type */
export class Integer {
    /**
     * Get a random integer between min value and max value.
     * min value should greater than 0, max value should less than 2^48-1 (281474976710655)
     *
     * @param min the min value (0 will be applied when not given)
     * @param max the max value (281474976710655 will be applied when not given)
     * @returns return the random value
     */
    public static random(min?: number, max?: number): number {
        const minNum = Math.max(min ?? 0, 0);
        const maxNum = Math.max(max ?? 281474976710655, minNum + 1);
        return crypto.randomInt(Math.min(minNum, maxNum), Math.max(minNum, maxNum));
    }

    /**
     * convert source number to be a 8-byte array
     *
     * @param srcValue source value
     * @returns return a 8-byte array
     */
    public static toBytes(srcValue: number): number[] {
        const bytes = [];

        let num = srcValue;
        for (let i = 7; i >= 0; --i) {
            bytes[i] = Integer.and(num, 255);
            num = Integer.right(num, 8);
        }

        return bytes;
    }

    /**
     * number left shift
     * times will be calculated to get the end 6-bit at the beginning to avoid over-flow
     *
     * @param value source value
     * @param times left shift steps
     * @returns return result value
     */
    public static left(value: number, times: number): number {
        // eslint-disable-next-line no-bitwise
        return value << (times & 0x3f);
    }

    /**
     * number right shift
     * times will be calculated to get the end 6-bit at the beginning to avoid over-flow
     *
     * @param value source value
     * @param times right shift steps
     * @returns return result value
     */
    public static right(value: number, times: number): number {
        // eslint-disable-next-line no-bitwise
        return value >> (times & 0x3f);
    }

    /**
     * number unsigned right shift
     * times will be calculated to get the end 6-bit at the beginning to avoid over-flow
     *
     * @param value source value
     * @param times right shift steps
     * @returns return result value
     */
    public static rightUnsigned(value: number, times: number): number {
        // eslint-disable-next-line no-bitwise
        return value >>> (times & 0x3f);
    }

    /**
     * or
     *
     * @param value1 the first value
     * @param values the following values array
     * @returns return calculated value
     */
    public static or(value1: number, ...values: number[]): number {
        let value = value1;
        for (const i of values) {
            // eslint-disable-next-line no-bitwise
            value |= i;
        }
        return value;
    }

    /**
     * and
     *
     * @param value1 the first value
     * @param values the following values array
     * @returns return calculated value
     */
    public static and(value1: number, ...values: number[]): number {
        let value = value1;
        for (const i of values) {
            // eslint-disable-next-line no-bitwise
            value &= i;
        }
        return value;
    }

    /**
     * xor
     *
     * @param value1 the first value
     * @param value2 the second value
     * @returns return calculated value
     */
    public static xor(value1: number, value2: number): number {
        // eslint-disable-next-line no-bitwise
        return value1 ^ value2;
    }
}

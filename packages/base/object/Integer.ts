/** @format */

import crypto from "crypto";

export class Integer {
    public static random(min?: number, max?: number): number {
        const minNum = Math.max(min ?? 0, 0);
        const maxNum = Math.max(max ?? 281474976710655, minNum + 1);
        return crypto.randomInt(Math.min(minNum, maxNum), Math.max(minNum, maxNum));
    }

    public static toBytes(srcValue: number): number[] {
        const bytes = [];

        let num = srcValue;
        for (let i = 7; i >= 0; --i) {
            bytes[i] = Integer.and(num, 255);
            num = Integer.right(num, 8);
        }

        return bytes;
    }

    public static left(value: number, times: number): number {
        // eslint-disable-next-line no-bitwise
        return value << times % 64;
    }

    public static right(value: number, times: number): number {
        // eslint-disable-next-line no-bitwise
        return value >> times % 64;
    }

    public static rightUnsigned(value: number, times: number): number {
        // eslint-disable-next-line no-bitwise
        return value >>> times % 64;
    }

    public static or(value1: number, ...values: number[]): number {
        let value = value1;
        for (const i of values) {
            // eslint-disable-next-line no-bitwise
            value |= i;
        }
        return value;
    }

    public static and(value1: number, ...values: number[]): number {
        let value = value1;
        for (const i of values) {
            // eslint-disable-next-line no-bitwise
            value &= i;
        }
        return value;
    }

    public static xor(value1: number, value2: number): number {
        // eslint-disable-next-line no-bitwise
        return value1 ^ value2;
    }
}

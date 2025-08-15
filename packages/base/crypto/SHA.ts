/** @format */

import fs from "fs";
import crypto from "crypto";

export class SHA {
    public static sha256(data: string | Buffer, encoding: NodeJS.BufferEncoding = "utf-8"): Buffer {
        return SHA.sha("sha256", data, encoding);
    }

    public static sha512(data: string | Buffer, encoding: NodeJS.BufferEncoding = "utf-8"): Buffer {
        return SHA.sha("sha512", data, encoding);
    }

    private static sha(algorithm: "sha256" | "sha512", data: string | Buffer, encoding: NodeJS.BufferEncoding): Buffer {
        const buffer = typeof data === "string" ? Buffer.from(data, encoding) : data;
        const hash = crypto.createHash(algorithm);
        hash.update(buffer);
        return hash.digest();
    }

    public static async stream256(stream: fs.ReadStream): Promise<Buffer> {
        return SHA.streamSHA("sha256", stream);
    }

    public static async stream512(stream: fs.ReadStream): Promise<Buffer> {
        return SHA.streamSHA("sha512", stream);
    }

    private static async streamSHA(algorithm: "sha256" | "sha512", stream: fs.ReadStream): Promise<Buffer> {
        const hash = crypto.createHash(algorithm);
        return new Promise<Buffer>((resolve) => {
            stream.on("data", (data: string | Buffer) => {
                hash.update(data);
            });
            stream.on("end", () => {
                resolve(hash.digest());
            });
        });
    }
}

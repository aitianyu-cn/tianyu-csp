/** @format */

import crypto from "crypto";
import Stream from "stream";

/** SHA Lib */
export class SHA {
    /**
     * Calculate SHA256 code of data based on specified string encoding.
     *
     * @param data source data
     * @param encoding string encoding type, default encoding type is 'utf-8', only used when data type is string
     * @returns return the SHA256 code buffer
     */
    public static sha256(data: string | Buffer, encoding: NodeJS.BufferEncoding = "utf-8"): Buffer {
        return SHA.sha("sha256", data, encoding);
    }

    /**
     * Calculate SHA512 code of data based on specified string encoding.
     *
     * @param data source data
     * @param encoding string encoding type, default encoding type is 'utf-8', only used when data type is string
     * @returns return the SHA256 code buffer
     */
    public static sha512(data: string | Buffer, encoding: NodeJS.BufferEncoding = "utf-8"): Buffer {
        return SHA.sha("sha512", data, encoding);
    }

    private static sha(algorithm: "sha256" | "sha512", data: string | Buffer, encoding: NodeJS.BufferEncoding): Buffer {
        const buffer = typeof data === "string" ? Buffer.from(data, encoding) : data;
        const hash = crypto.createHash(algorithm);
        hash.update(buffer);
        return hash.digest();
    }

    /**
     * Calculate SHA256 code of data based on a stream
     *
     * @param stream data stream
     * @returns return the encoded buffer
     */
    public static async stream256(stream: Stream): Promise<Buffer> {
        return SHA.streamSHA("sha256", stream);
    }

    /**
     * Calculate SHA512 code of data based on a stream
     *
     * @param stream data stream
     * @returns return the encoded buffer
     */
    public static async stream512(stream: Stream): Promise<Buffer> {
        return SHA.streamSHA("sha512", stream);
    }

    private static async streamSHA(algorithm: "sha256" | "sha512", stream: Stream): Promise<Buffer> {
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

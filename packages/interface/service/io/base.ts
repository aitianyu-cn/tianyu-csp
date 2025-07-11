/** @format */

export type IOFileDirectionType = "internal" | "external";

export type IOFileFlags = "read" | "read_write" | "write_create" | "rw_create" | "append_create" | "append_read_create";

export interface IOFilePath {
    type: IOFileDirectionType;
    path: string;
}

export interface IOFileBuffer {
    buffer: Buffer;
    start?: number;
    length?: number;
}

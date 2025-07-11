/** @format */

/**
 * IO File absolute path type
 * - internal: the file or dir is in current project
 * - external: the file path is a full patch of system
 */
export type IOFileDirectionType = "internal" | "external";

/** IO File open flag */
export type IOFileFlags = "read" | "read_write" | "write_create" | "rw_create" | "append_create" | "append_read_create";

/** Tianyu CSP IO File Path */
export interface IOFilePath {
    /** path direction type */
    type: IOFileDirectionType;
    /**
     * Path string
     * - a relative path when the direction is "internal"
     * - a full path of system when the direction is "external"
     */
    path: string;
}

/** IO File Data Buffer */
export interface IOFileBuffer {
    /** Buffer array */
    buffer: Buffer;
    /** the start bytes of buffer to read or write */
    start?: number;
    /** the bytes count of buffer to read or write */
    length?: number;
}

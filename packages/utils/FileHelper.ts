/** @format */

import fs from "fs";
import path from "path";
import { IOFileBuffer, IOFileFlags, IOFilePath } from "#interface";
import { ErrorHelper } from "#utils";
import { IO_ERROR_CODES } from "#core/Constant";
import { PROJECT_ROOT_PATH } from "packages/Common";

export class FileHelper {
    public static async open(file: IOFilePath, flag: IOFileFlags): Promise<number> {
        const filePath = FileHelper.transformFilePath(file);
        return new Promise<number>((resolve, reject) => {
            fs.open(filePath, FileHelper.transformFileFlag(flag), null, (err: NodeJS.ErrnoException | null, fd: number) => {
                if (err) {
                    reject(
                        ErrorHelper.getError(
                            IO_ERROR_CODES.IO_FILE_OPEN_FAILED,
                            `open file[${filePath}] in mode[${flag}] failed - error: ${err.message}`,
                            err.stack,
                        ),
                    );
                } else {
                    resolve(fd);
                }
            });
        });
    }

    public static async read(file: IOFilePath | number, buffer: IOFileBuffer, position: number): Promise<number> {
        const shouldRelease = typeof file !== "number";
        const fd = shouldRelease ? await FileHelper.open(file, "read") : file;

        return new Promise<number>((resolve, reject) => {
            fs.read(
                fd,
                buffer.buffer,
                buffer.start || 0,
                buffer.length || buffer.buffer.byteLength,
                position,
                async (err: NodeJS.ErrnoException | null, bytesRead: number) => {
                    if (shouldRelease) {
                        await FileHelper.close(fd);
                    }

                    if (err) {
                        reject(
                            ErrorHelper.getError(
                                IO_ERROR_CODES.IO_FILE_READ_FAILED,
                                `read file[${file}] failed - error: ${err.message}`,
                                err.stack,
                            ),
                        );
                    } else {
                        resolve(bytesRead);
                    }
                },
            );
        });
    }

    public static async write(file: IOFilePath | number, buffer: IOFileBuffer, position?: number): Promise<void> {
        const shouldRelease = typeof file !== "number";
        const fd = shouldRelease ? await FileHelper.open(file, "write_create") : file;

        return new Promise<void>((resolve, reject) => {
            fs.write(
                fd,
                buffer.buffer,
                buffer.start,
                buffer.length,
                position,
                async (err: NodeJS.ErrnoException | null, bytesWriten: number) => {
                    if (shouldRelease) {
                        await FileHelper.flush(fd);
                        await FileHelper.close(fd);
                    }

                    const bufferSize = buffer.length || buffer.buffer.byteLength;
                    const bufferStart = buffer.start || 0;
                    const bufferStringCut = bufferSize - bufferStart > 1024;
                    if (err) {
                        reject(
                            ErrorHelper.getError(
                                IO_ERROR_CODES.IO_FILE_WRITE_FAILED,
                                `write file[${file}] with data[${buffer.buffer.toString(
                                    "utf-8",
                                    buffer.start,
                                    bufferStringCut ? 1024 : bufferSize - bufferStart,
                                )}${bufferStringCut ? "..." : ""}] failed - error: ${err.message}`,
                                err.stack,
                            ),
                        );
                    } else {
                        if (bytesWriten === bufferSize) {
                            resolve();
                        } else {
                            reject(
                                ErrorHelper.getError(
                                    IO_ERROR_CODES.IO_FILE_WRITE_FAILED,
                                    `write file[${file}] with data[${buffer.buffer.toString(
                                        "utf-8",
                                        buffer.start,
                                        bufferStringCut ? 1024 : bufferSize - bufferStart,
                                    )}${bufferStringCut ? "..." : ""}] failed - error: expect write data ${
                                        buffer.length
                                    } bytes, but only written ${bytesWriten} bytes`,
                                ),
                            );
                        }
                    }
                },
            );
        });
    }

    public static async flush(fd: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.fsync(fd, (err: NodeJS.ErrnoException | null) => {
                if (err) {
                    reject(
                        ErrorHelper.getError(
                            IO_ERROR_CODES.IO_FILE_OPERATION_FAILED,
                            `flush file[${fd}] failed - error: ${err.message}`,
                            err.stack,
                        ),
                    );
                } else {
                    resolve();
                }
            });
        });
    }

    public static async close(fd: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.close(fd, (err: NodeJS.ErrnoException | null) => {
                if (err) {
                    reject(
                        ErrorHelper.getError(
                            IO_ERROR_CODES.IO_FILE_OPERATION_FAILED,
                            `close file[${fd}] failed - error: ${err.message}`,
                            err.stack,
                        ),
                    );
                } else {
                    resolve();
                }
            });
        });
    }

    public static async setLength(file: IOFilePath, length: number): Promise<void> {
        const filePath = FileHelper.transformFilePath(file);
        return new Promise<void>((resolve, reject) => {
            fs.truncate(filePath, length, async (err: NodeJS.ErrnoException | null) => {
                if (err) {
                    reject(
                        ErrorHelper.getError(
                            IO_ERROR_CODES.IO_FILE_OPERATION_FAILED,
                            `set length of file[${filePath}] to ${length} failed - error: ${err.message}`,
                            err.stack,
                        ),
                    );
                } else {
                    resolve();
                }
            });
        });
    }

    public static async mkdir(file: IOFilePath): Promise<string | undefined> {
        const filePath = FileHelper.transformFilePath(file);
        return new Promise<string | undefined>((resolve, reject) => {
            fs.mkdir(filePath, { recursive: true }, (err: NodeJS.ErrnoException | null, path?: string) => {
                if (err) {
                    reject(
                        ErrorHelper.getError(
                            IO_ERROR_CODES.IO_DIR_OPERATION_FAILED,
                            `create dir[${filePath}] failed - error: ${err.message}`,
                            err.stack,
                        ),
                    );
                } else {
                    resolve(path);
                }
            });
        });
    }

    public static exist(file: IOFilePath): boolean {
        const filePath = FileHelper.transformFilePath(file);
        return fs.existsSync(filePath);
    }

    public static async remove(file: IOFilePath): Promise<void> {
        const filePath = FileHelper.transformFilePath(file);
        return new Promise<void>((resolve, reject) => {
            fs.rm(filePath, (err: NodeJS.ErrnoException | null) => {
                if (err) {
                    reject(
                        ErrorHelper.getError(
                            IO_ERROR_CODES.IO_FILE_OPERATION_FAILED,
                            `remove file[${filePath}] failed - error: ${err.message}`,
                            err.stack,
                        ),
                    );
                } else {
                    resolve();
                }
            });
        });
    }

    public static async rmdir(file: IOFilePath): Promise<void> {
        const filePath = FileHelper.transformFilePath(file);
        return new Promise<void>((resolve, reject) => {
            fs.rmdir(filePath, (err: NodeJS.ErrnoException | null) => {
                if (err) {
                    reject(
                        ErrorHelper.getError(
                            IO_ERROR_CODES.IO_FILE_OPERATION_FAILED,
                            `remove dir[${filePath}] failed - error: ${err.message}`,
                            err.stack,
                        ),
                    );
                } else {
                    resolve();
                }
            });
        });
    }

    public static transformFilePath(file: IOFilePath): string {
        if (file.type === "internal") {
            return path.join(PROJECT_ROOT_PATH, file.path);
        }
        return file.path;
    }

    public static transformFileFlag(flag: IOFileFlags): string {
        switch (flag) {
            case "read":
                return "r";
            case "read_write":
                return "r+";
            case "write_create":
                return "w";
            case "rw_create":
                return "w+";
            case "append_create":
                return "a";
            case "append_read_create":
                return "a+";
            default:
                return "w+";
        }
    }
}

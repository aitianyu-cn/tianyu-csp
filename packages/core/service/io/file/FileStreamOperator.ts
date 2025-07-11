/** @format */

import fs from "fs";
import { IOFileFlags, IOFilePath } from "#interface";
import { ErrorHelper, FileHelper } from "#utils";
import { IO_ERROR_CODES } from "#core/Constant";

export class FileStreamOperator {
    private _file: IOFilePath;
    private _flag: IOFileFlags;

    private _fd: number;
    private _position: number;
    private _size: number;

    private _changed: boolean;

    public constructor(file: IOFilePath, flag?: IOFileFlags) {
        this._file = file;
        this._flag = flag || "read_write";

        this._fd = -1;
        this._position = -1;
        this._size = -1;
        this._changed = false;
    }

    public get isOpened(): boolean {
        return this._fd !== -1;
    }
    public get position(): number {
        return this._position;
    }
    public get size(): number {
        return this._size;
    }
    public get modified(): boolean {
        return this._changed;
    }

    public async open(): Promise<void> {
        if (!this.isOpened) {
            this._fd = await FileHelper.open(this._file, this._flag);
            this._position = 0;
            this._size = fs.fstatSync(this._fd, {}).size;
        }
    }

    public async close(forceSave?: boolean): Promise<void> {
        if (this.modified) {
            if (forceSave) {
                return Promise.reject(
                    ErrorHelper.getError(
                        IO_ERROR_CODES.IO_FILE_OPERATION_FAILED,
                        `[FileStreamOperator] try to close a file failed, due to the file is modified but not saved.`,
                        `
                        file: ${FileHelper.transformFilePath(this._file)}\n
                        action: you can save the file by call <insance>.flush or set forceSave of <instance>.close() parameter to be false, and try again
                        `,
                    ),
                );
            }

            await this.flush();
        }
        if (this.isOpened) {
            await FileHelper.close(this._fd);
            this._fd = -1;
        }
    }

    public async read(length: number): Promise<Buffer> {
        const read_length = this.size - this.position < length ? this.size - this.position : length;
        const read_buffer = Buffer.alloc(read_length, 0x00);
        const bytesRead = await FileHelper.read(
            this._fd,
            {
                buffer: read_buffer,
                start: 0,
                length: read_length,
            },
            this.position,
        );
        this._position += bytesRead;
        return read_buffer.subarray(0, bytesRead);
    }

    public async write(buffer: Buffer): Promise<void> {
        await FileHelper.write(
            this._fd,
            {
                buffer,
            },
            this.position,
        );

        this._position = this.position + buffer.byteLength;

        this._changed = true;
    }

    public async flush(): Promise<void> {
        await FileHelper.flush(this._fd);
        this._size = fs.fstatSync(this._fd, {}).size;
        this._changed = false;
    }

    public async setLength(length: number): Promise<void> {
        const isOpen = this.isOpened;
        if (isOpen) {
            await this.close();
        }
        await FileHelper.setLength(this._file, length);
        if (isOpen) {
            const pre_flag = this._flag;
            this._flag = "read_write";
            await this.open();

            this._flag = pre_flag;
        }
    }

    public seek(position?: number): void {
        this._position = position ? (position > this.size ? this.size : position) : 0;
    }
}

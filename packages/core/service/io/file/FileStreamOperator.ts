/** @format */

import fs from "fs";
import { IOFileFlags, IOFilePath } from "#interface";
import { ErrorHelper, FileHelper } from "#utils";
import { IO_ERROR_CODES } from "#core/Constant";

/** File Binary Stream Operator */
export class FileStreamOperator {
    private _file: IOFilePath;
    private _flag: IOFileFlags;

    private _fd: number;
    private _position: number;
    private _size: number;

    private _changed: boolean;

    /**
     * To create a Binary File Stream instance
     *
     * @param file the target file path
     * @param flag file operation flag
     */
    public constructor(file: IOFilePath, flag?: IOFileFlags) {
        this._file = file;
        this._flag = flag || "read_write";

        this._fd = -1;
        this._position = -1;
        this._size = -1;
        this._changed = false;
    }

    /** Get current file is opened or not */
    public get isOpened(): boolean {
        return this._fd !== -1;
    }
    /** Get a value that indicates where the current file pointer is */
    public get position(): number {
        return this._position;
    }
    /** Get a value that is the current file size */
    public get size(): number {
        return this._size;
    }
    /** Get a value indicates the file is changed or not */
    public get modified(): boolean {
        return this._changed;
    }

    /** To open the file */
    public async open(): Promise<void> {
        if (!this.isOpened) {
            this._fd = await FileHelper.open(this._file, this._flag);
            this._position = 0;
            this._size = fs.fstatSync(this._fd, {}).size;
        }
    }

    /**
     * To close current file operator and release system resources
     *
     * @param forceSave to force checking the file modification status when set to "true", when set to "false", the file will be saved automatically if it is modified.
     *                  if the file is modified and "forceSave" is set to "true", an exception will be throw.
     */
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

    /**
     * To read a given length bytes from file and move the file pointer position to increase given count
     *
     * @param length the bytes count request to get
     * @returns return a bytes buffer of reading data, the length would be less than given length due to the request bytes count is greater than actual file size
     */
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

    /**
     * To write given buffer to file
     *
     * @param buffer the data buffer
     */
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

    /** To flush the changed data and save them into disk */
    public async flush(): Promise<void> {
        await FileHelper.flush(this._fd);
        this._size = fs.fstatSync(this._fd, {}).size;
        this._changed = false;
    }

    /**
     * To set the file size to specified length.
     * - if the file length is greater than given length, the file data which the position is greater than given length will be removed.
     * - if the file length is less than given length, the file will be extended to given length, and added data will be filled with '\0'
     *
     * @param length new given file length
     */
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

    /**
     * To change the file operation position to specified location
     *
     * @param position new position
     *                 - if the position is undefined or less than 0, 0 value will be applied
     *                 - if the position is greater than file size, the file size will be applied
     */
    public seek(position?: number): void {
        this._position = position ? (position > this.size ? this.size : position < 0 ? 0 : position) : 0;
    }
}

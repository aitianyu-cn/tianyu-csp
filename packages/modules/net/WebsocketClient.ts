/** @format */

import { IReleasable } from "#interface";
import { guid } from "@aitianyu.cn/types";
import { ClientRequestArgs } from "http";
import { ClientOptions, RawData, WebSocket } from "ws";

export class WebsocketClient implements IReleasable {
    private _id: string;
    private _socket: WebSocket;
    private _connecting: Promise<void>;

    public onData?: (data: RawData, isBinary: boolean) => void;
    public onPing?: (data: RawData) => void;
    public onPong?: (data: RawData) => void;
    public onError?: (error: Error) => void;

    public constructor(address: string | URL, protocols?: string | string[], options?: ClientOptions | ClientRequestArgs) {
        this._id = guid();
        this._socket = new WebSocket(address, protocols, options);

        this._connecting = new Promise<void>((resolve) => {
            this._socket.once("open", () => {
                TIANYU.lifecycle.join(this);
                resolve();
            });
        });
        this._socket.on("close", () => {
            TIANYU.lifecycle.leave(this.id);
        });
        this._socket.on("message", this.onmessage.bind(this));
        this._socket.on("ping", this.onping.bind(this));
        this._socket.on("pong", this.onpong.bind(this));
        this._socket.on("error", this.onerror.bind(this));
    }

    public get id(): string {
        return this._id;
    }

    public async connect(): Promise<void> {
        await this._connecting;
    }

    public async close(): Promise<void> {
        this._socket.close();
    }

    public async send(data: Buffer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._socket.send(data, (error?: Error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private onmessage(data: RawData, isBinary: boolean): void {
        this.onData?.(data, isBinary);
    }

    /* istanbul ignore next */
    private onping(data: RawData): void {
        this.onPing?.(data);
    }

    /* istanbul ignore next */
    private onpong(data: RawData): void {
        this.onPong?.(data);
    }

    /* istanbul ignore next */
    private onerror(error: Error): void {
        this.onError?.(error);
    }
}

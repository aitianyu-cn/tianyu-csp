/** @format */

import { StringObj } from "#base/index";
import { IWSServerConnection } from "#interface";
import { IncomingMessage } from "http";
import { RawData, WebSocket } from "ws";

export class WebsocketConnection implements IWSServerConnection {
    private _id: string;
    private _socket: WebSocket;
    private _request: IncomingMessage;
    private _stop: () => void;

    private onError?: (id: string, error: Error) => void;
    private onReceive?: (id: string, message: RawData, isBinary: boolean) => void;
    private onPing?: (id: string, data: Buffer) => void;

    public constructor(id: string, socket: WebSocket, request: IncomingMessage, stop: () => void) {
        this._id = id;
        this._socket = socket;
        this._request = request;
        this._stop = stop;

        this._socket.on("message", this.receive.bind(this));
        this._socket.on("error", this.error.bind(this));
        this._socket.on("close", this.closeInternal.bind(this));
        this._socket.on("ping", this.ping.bind(this));
    }

    public async post(message: any): Promise<void> {
        const data = StringObj.stringifySafe(message);
        return new Promise<void>((resolve, reject) => {
            this._socket.send(Buffer.from(data, "utf-8"), (error?: Error) => {
                if (error) {
                    this.onError?.(this._id, error);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    public on(
        event: "message" | "error" | "ping",
        cb:
            | ((id: string, message: RawData, isBinary: boolean) => void)
            | ((id: string, error: Error) => void)
            | ((id: string, data: Buffer) => void),
    ): this {
        switch (event) {
            case "message":
                this.onReceive = cb as (id: string, message: RawData, isBinary: boolean) => void;
                break;
            case "error":
                this.onError = cb as (id: string, error: Error) => void;
                break;
            case "ping":
                this.onPing = cb as (id: string, data: Buffer) => void;
                break;
            /* istanbul ignore next */ default:
                break;
        }
        return this;
    }

    public close(): void {
        this._socket.close();
    }

    private closeInternal(): void {
        this.close();
        this._stop();
    }

    private receive(data: RawData, isBinary: boolean): void {
        this.onReceive?.(this._id, data, isBinary);
    }
    private error(error: Error): void {
        this.onError?.(this._id, error);
    }
    private ping(data: Buffer): void {
        this.onPing?.(this._id, data);
    }
}

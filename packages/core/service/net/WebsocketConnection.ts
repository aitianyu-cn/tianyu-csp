/** @format */

import { StringObj } from "#base/index";
import { IWSClientSendOption, IWSServerConnection } from "#interface";
import { IncomingMessage } from "http";
import { RawData, WebSocket } from "ws";

/** Web Socket event emit types */
export type WebSocketEmittedType = "message" | "error" | "ping" | "pong" | "close";

/** CSP Packaged Web Socket Connection */
export class WebsocketConnection implements IWSServerConnection {
    private _id: string;
    private _socket: WebSocket;
    private _request: IncomingMessage;

    private onError?: (error: Error) => void;
    private onReceive?: (message: RawData, isBinary: boolean) => void;
    private onPing?: (data: Buffer) => void;
    private onPong?: (data: Buffer) => void;
    private onClose?: (code: number, reason: Buffer) => void;

    /**
     * Create instance
     *
     * @param id connection id
     * @param socket web socket connection instance
     * @param request web socket connection request message
     */
    public constructor(id: string, socket: WebSocket, request: IncomingMessage) {
        this._id = id;
        this._socket = socket;
        this._request = request;

        this._socket.on("message", this.onreceive.bind(this));
        this._socket.on("error", this.onerror.bind(this));
        this._socket.on("close", this.onclose.bind(this));
        this._socket.on("ping", this.onping.bind(this));
        this._socket.on("pong", this.onpong.bind(this));
    }

    public async post(message: any, option?: IWSClientSendOption): Promise<void> {
        const data = StringObj.stringifySafe(message);
        return new Promise<void>((resolve, reject) => {
            this._socket.send(Buffer.from(data, "utf-8"), option || {}, (error?: Error) => {
                if (error) {
                    this.onError?.(error);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    public async ping(data?: any, mask?: boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._socket.ping(data, mask, (error?: Error) => {
                if (error) {
                    this.onError?.(error);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    public async pong(data?: any, mask?: boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._socket.pong(data, mask, (error?: Error) => {
                if (error) {
                    this.onError?.(error);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    public get status(): 0 | 1 | 2 | 3 {
        return this._socket.readyState;
    }

    public on(
        event: WebSocketEmittedType,
        cb:
            | ((message: RawData, isBinary: boolean) => void)
            | ((code: number, reason: Buffer) => void)
            | ((error: Error) => void)
            | ((data: Buffer) => void),
    ): this {
        switch (event) {
            case "message":
                this.onReceive = cb as (message: RawData, isBinary: boolean) => void;
                break;
            case "error":
                this.onError = cb as (error: Error) => void;
                break;
            case "ping":
                this.onPing = cb as (data: Buffer) => void;
                break;
            case "pong":
                this.onPong = cb as (data: Buffer) => void;
                break;
            case "close":
                this.onClose = cb as (code: number, reason: Buffer) => void;
                break;
            /* istanbul ignore next */ default:
                break;
        }
        return this;
    }

    public close(): void {
        this._socket.close();
    }

    private onclose(code: number, reason: Buffer): void {
        this.onClose?.(code, reason);
    }
    private onreceive(data: RawData, isBinary: boolean): void {
        this.onReceive?.(data, isBinary);
    }
    private onerror(error: Error): void {
        this.onError?.(error);
    }
    private onping(data: Buffer): void {
        this.onPing?.(data);
    }
    private onpong(data: Buffer): void {
        this.onPong?.(data);
    }
}

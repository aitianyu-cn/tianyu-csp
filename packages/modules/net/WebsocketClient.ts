/** @format */

import { IReleasable, IWSClientSendOption } from "#interface";
import { guid } from "@aitianyu.cn/types";
import { ClientRequestArgs } from "http";
import { ClientOptions, RawData, WebSocket } from "ws";

/** Web Socket Client */
export class WebsocketClient implements IReleasable {
    private _id: string;
    private _socket: WebSocket;
    private _connecting: Promise<void>;

    public onData?: (data: RawData, isBinary: boolean) => void;
    public onPing?: () => void;
    public onPong?: () => void;
    public onError?: (error: Error) => void;

    /**
     * Create a Web Socket Instance
     *
     * @param address remote server address
     * @param protocols connection protocols defines
     * @param options client options
     */
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

    /**
     * Waiting for client connection established
     *
     * @returns return a waiting promise
     */
    public async connect(): Promise<void> {
        await this._connecting;
    }

    public async close(): Promise<void> {
        this._socket.close();
    }

    /**
     * To send data to server
     *
     * @param data data to send
     * @param options sending options
     * @returns return a promise for sending done
     */
    public async send(data: Buffer, options?: IWSClientSendOption): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._socket.send(data, options || {}, (error?: Error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * To send a connection ping
     *
     * @param data ping data
     * @param mask flag to enabld the data encrypto
     * @returns return a promise for pinging done
     */
    public async ping(data?: any, mask?: boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._socket.ping(data, mask, (error?: Error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * To send a connection pong
     *
     * @param data pong data
     * @param mask flag to enabld the data encrypto
     * @returns return a promise for ponging done
     */
    public async pong(data?: any, mask?: boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._socket.pong(data, mask, (error?: Error) => {
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
    private onping(): void {
        this.onPing?.();
    }

    /* istanbul ignore next */
    private onpong(): void {
        this.onPong?.();
    }

    /* istanbul ignore next */
    private onerror(error: Error): void {
        this.onError?.(error);
    }
}

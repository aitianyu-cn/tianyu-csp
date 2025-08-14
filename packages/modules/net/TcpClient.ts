/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { TcpClientOptions } from "#interface";
import { ErrorHelper } from "#utils";
import { guid } from "@aitianyu.cn/types";
import net from "net";
import { IReleasable } from "packages/interface/api/lifecycle";

/** TCP Client */
export class TcpClient implements IReleasable {
    private _client: net.Socket;
    private _log: boolean;
    private _id: string;

    /** Given a function to handle client error */
    public onError?: (error: Error) => void;
    /** Given a function to handle client received data */
    public onData?: (data: Buffer) => void;

    /**
     * To create a TCP client instance
     *
     * @param options client creation option
     */
    public constructor(options: TcpClientOptions) {
        this._log = !!options.log;

        this._id = guid();
        this._client = new net.Socket();

        this._client.on("error", this.errorHandler.bind(this));
        this._client.on("data", this.receiveHandler.bind(this));
    }

    public get id(): string {
        return this._id;
    }

    /**
     * Async function to start a connection with specified options
     *
     * @param options TCP socket connection option
     * @returns return a promise
     */
    public async connect(options: net.TcpSocketConnectOpts): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const connectionErrorHandler = (error: Error) => {
                const err_msg = `connect to remote[${options.host}:${options.port}] failed - ${error.message}`;
                const err = ErrorHelper.getError(SERVICE_ERROR_CODES.INTERNAL_ERROR, err_msg, error.stack);
                this._log && void TIANYU.audit.error("client/tcp", err_msg, err);

                reject(err);
            };
            this._client.once("error", connectionErrorHandler);

            this._client.connect(options, () => {
                TIANYU.lifecycle.join(this);
                resolve();
            });
        });
    }

    /** To close current connection */
    public close(): void {
        this._client.destroy();
        TIANYU.lifecycle.leave(this.id);
    }

    /**
     * To send message
     *
     * @param msg message bytes buffer
     * @returns return a promise. resolved when the message is sent successfully and reject when there is an error occurs.
     */
    public async send(msg: Buffer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._client.write(msg, (error?: Error) => {
                if (!error) {
                    resolve();
                } else {
                    const err_msg = `send to remote[${this._client.remoteAddress}:${
                        this._client.remotePort
                    }] failed - source data[${msg.toString("utf-8")}] - ${error.message}`;
                    const err = ErrorHelper.getError(SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR, err_msg, error.stack);
                    this._log && void TIANYU.audit.error("client/tcp", err_msg, err);

                    reject(err);
                }
            });
        });
    }

    private errorHandler(error: Error): void {
        this.onError?.(error);
    }

    private receiveHandler(data: Buffer): void {
        this.onData?.(data);
    }
}

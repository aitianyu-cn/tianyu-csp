/** @format */

import { MessageBundle } from "#base/res/InternalMessageBundle";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { TcpService } from "#core/service/net/TcpService";
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

    private _pingMsg: string;
    private _pongMsg: string;
    private _autoPing: boolean;
    private _autoPong: boolean;

    private _overtime: number;
    private _watcher: NodeJS.Timeout | null;

    private _healthy: "health" | "unhealth" | "died";

    /** Given a function to handle client error */
    public onError?: (error: Error) => void;
    /** Given a function to handle client received data */
    public onData?: (data: Buffer) => void;
    public onPing?: () => void;
    public onPong?: () => void;

    /**
     * To create a TCP client instance
     *
     * @param options client creation option
     */
    public constructor(options: TcpClientOptions) {
        this._log = !!options.log;

        this._autoPing = !!options.autoPing;
        this._autoPong = !!options.autoPong;
        this._pingMsg = options.pingMsg || TcpService.DEFAULT_PING;
        this._pongMsg = options.pongMsg || TcpService.DEFAULT_PONG;

        this._overtime = options.timeout || TcpService.DEFAULT_TIMEOUT_TIME;
        this._watcher = null;

        this._healthy = "died";

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
                const err_msg = MessageBundle.text(
                    "ERROR_MODULES_NET_TCP_CONNECTION_ERROR",
                    String(options.host),
                    String(options.port),
                    error.message,
                ); // `connect to remote[${options.host}:${options.port}] failed - ${error.message}`;
                const err = ErrorHelper.getError(SERVICE_ERROR_CODES.INTERNAL_ERROR, err_msg, error.stack);
                this._log && void TIANYU.audit.error("client/tcp", err_msg, err);

                reject(err);
            };
            this._client.once("error", connectionErrorHandler);

            this._client.connect(options, () => {
                this._healthy = "health";
                TIANYU.lifecycle.join(this);
                this.setWatcher();
                resolve();
            });
        });
    }

    /** To close current connection */
    public close(): void {
        this.resetWatcher();
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
        return this.sendMessage(msg, "ERROR_MODULES_NET_TCP_UDP_REQUEST_FAILED");
    }

    public async ping(): Promise<void> {
        return this.sendMessage(Buffer.from(this._pingMsg, "utf-8"), "ERROR_MODULES_NET_TCP_HEARTBEAT_PING_FAILED");
    }

    public async pong(): Promise<void> {
        return this.sendMessage(Buffer.from(this._pongMsg, "utf-8"), "ERROR_MODULES_NET_TCP_HEARTBEAT_PONG_FAILED");
    }

    private async sendMessage(data: Buffer, key: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._client.write(data, (error?: Error | null) => {
                if (error) {
                    const err_msg = MessageBundle.text(
                        key,
                        String(this._client.remoteAddress),
                        String(this._client.remotePort),
                        data.toString("utf-8"),
                        error?.message,
                    );
                    const err = ErrorHelper.getError(SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR, err_msg, error?.stack);
                    this._log && void TIANYU.audit.error("client/tcp", err_msg, err);

                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    private errorHandler(error: Error): void {
        this.onError?.(error);
    }

    private receiveHandler(data: Buffer): void {
        this._healthy = "health";

        const toStr = data.toString("utf-8");
        if (toStr === this._pingMsg) {
            this.onping();
        } else if (toStr === this._pongMsg) {
            this.onpong();
        } else {
            this.onMsg?.(data);
        }
    }

    private onpong(): void {
        this.resetWatcher();
        this.setWatcher();

        this.onPong?.();
    }

    private onping(): void {
        this.resetWatcher();
        if (this._autoPong) {
            void this.pong()
                .catch(() => {
                    this._log &&
                        void TIANYU.audit.error(
                            "client/tcp",
                            MessageBundle.text(
                                "ERROR_MODULES_NET_TCP_AUTO_PONG_FAILED",
                                String(this._client.remoteAddress),
                                String(this._client.remotePort),
                            ),
                        );
                })
                .finally(() => {
                    this.setWatcher();
                });
        }

        this.onPing?.();
    }

    private onMsg(data: Buffer): void {
        this.resetWatcher();
        this.onData?.(data);
        this.setWatcher();
    }

    private resetWatcher(): void {
        if (this._watcher) {
            clearTimeout(this._watcher);
            this._watcher = null;
        }
    }

    private setWatcher(): void {
        if (this._autoPing) {
            this._watcher = setTimeout(this.watcherHandler.bind(this), this._overtime);
        }
    }

    private async watcherHandler(): Promise<void> {
        this._watcher = null;
        if (this._healthy === "died") {
            this.close();
            return;
        }

        this._healthy = this._healthy === "health" ? "unhealth" : "died";

        void this.ping().then(
            () => {
                this.setWatcher();
            },
            () => {
                this._log &&
                    void TIANYU.audit.error(
                        "client/tcp",
                        MessageBundle.text(
                            "ERROR_MODULES_NET_TCP_AUTO_HEARTBEAT_FAILED",
                            String(this._client.remoteAddress),
                            String(this._client.remotePort),
                        ),
                    );
            },
        );
    }
}

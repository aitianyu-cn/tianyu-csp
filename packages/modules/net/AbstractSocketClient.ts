/** @format */

import { MessageBundle } from "#base/res/InternalMessageBundle";
import { SocketListenerItem } from "#core/service/net/AbstractSocketService";
import { TcpService } from "#core/service/net/TcpService";
import { IReleasable, ISocketAddress, ISocketLongConnectionOption, SocketClientOptions, SocketProtocal } from "#interface";
import { guid } from "@aitianyu.cn/types";

export interface SocketClientEventMapSrc {
    message: (data: Buffer) => void;
    error: (error: Error) => void;
    ping: () => void;
    pong: () => void;
    close: () => void;
    connect: () => void;
}

export type SocketClientEventEmitKeys<MAP extends SocketClientEventMapSrc> = keyof MAP;
export type SocketClientEventEmitEventCB<MAP extends SocketClientEventMapSrc, K extends SocketClientEventEmitKeys<MAP>> = MAP[K];

export type SocketListener<MAP extends SocketClientEventMapSrc> = Record<
    SocketClientEventEmitKeys<MAP>,
    SocketListenerItem<SocketClientEventEmitEventCB<MAP, SocketClientEventEmitKeys<MAP>>>
>;

export interface ISocketClientInstanceType {
    on(event: "connect", listener: () => void): void;
    on(event: "error", listener: (error: Error) => void): void;
    on(event: "close", listener: (...args: any[]) => void): void;
}

export abstract class AbstractSocketClient<
    SOCKET extends ISocketClientInstanceType,
    EMIT_MAP extends SocketClientEventMapSrc = SocketClientEventMapSrc,
> implements IReleasable
{
    private _id: string;
    private _log: boolean;
    private _type: SocketProtocal;
    private _listeners: Partial<SocketListener<EMIT_MAP>>;

    private _connecting: Promise<void>;
    private _connecting_processed: boolean;

    private _autoPing: boolean;
    private _autoPong: boolean;

    private _overtime: number;
    private _watcher: NodeJS.Timeout | null;

    private _healthy: "health" | "unhealth" | "died";

    protected _socket: SOCKET;

    public constructor(type: SocketProtocal, socket: SOCKET, options?: ISocketLongConnectionOption & SocketClientOptions) {
        this._id = guid();
        this._type = type;
        this._socket = socket;
        this._listeners = {};

        this._log = !!options?.log;
        this._autoPing = !!options?.autoPing;
        this._autoPong = !!options?.autoPong;

        this._overtime = options?.timeout || TcpService.DEFAULT_TIMEOUT_TIME;
        this._watcher = null;

        this._healthy = "died";

        this._socket.on("close", this.onclose.bind(this));
        this._socket.on("error", this.onerror.bind(this));

        this._connecting_processed = false;
        this._connecting = new Promise<void>((resolve, reject) => {
            this.once("connect", () => {
                if (!this._connecting_processed) {
                    this._connecting_processed = true;
                    resolve();
                }
            });
            this.once("error", () => {
                if (!this._connecting_processed) {
                    this._connecting_processed = true;
                    reject();
                }
            });
        });
    }

    public get id(): string {
        return this._id;
    }

    /**
     * Waiting for client connection established
     *
     * @returns return a waiting promise
     */
    public async connecting(): Promise<void> {
        await this._connecting;
    }

    public on<E extends SocketClientEventEmitKeys<EMIT_MAP>>(event: E, cb: SocketClientEventEmitEventCB<EMIT_MAP, E>): this {
        if (!this._listeners[event]) {
            this._listeners[event] = { on: [], once: [] };
        }

        this._listeners[event].on.push(cb);
        return this;
    }
    public once<E extends SocketClientEventEmitKeys<EMIT_MAP>>(event: E, cb: SocketClientEventEmitEventCB<EMIT_MAP, E>): this {
        if (!this._listeners[event]) {
            this._listeners[event] = { on: [], once: [] };
        }

        this._listeners[event].once.push(cb);
        return this;
    }

    public abstract close(): Promise<void>;
    public abstract send(data: Buffer, ...args: any[]): Promise<void>;
    public abstract ping(): Promise<void>;
    public abstract pong(): Promise<void>;

    protected abstract get remote(): ISocketAddress;

    protected get health(): "health" | "unhealth" | "died" {
        return this._healthy;
    }
    protected set health(value: "health" | "unhealth" | "died") {
        this._healthy = value;
    }
    protected get log(): boolean {
        return this._log;
    }
    protected resetWatcher(): void {
        if (this._watcher) {
            clearTimeout(this._watcher);
            this._watcher = null;
        }
    }

    protected setWatcher(): void {
        if (this._autoPing) {
            this._watcher = setTimeout(this.watcherHandler.bind(this), this._overtime);
        }
    }

    protected onmessage(data: Buffer): void {
        this._healthy = "health";
        this.resetWatcher();
        this.emitevent("message", data);
        this.setWatcher();
    }
    protected onping(): void {
        this._healthy = "health";
        this.resetWatcher();
        this.emitevent("ping");
        if (this._autoPong) {
            void this.pong()
                .catch(() => {
                    this._healthy = "unhealth";
                    this._log &&
                        void TIANYU.audit.error(
                            `client/${this._type}`,
                            MessageBundle.text(
                                "ERROR_MODULES_NET_SOCKET_AUTO_PONG_FAILED",
                                this._type,
                                this.remote.address,
                                this.remote.port,
                            ),
                        );
                })
                .finally(() => {
                    this.setWatcher();
                });
        }
    }
    protected onpong(): void {
        this._healthy = "health";
        this.resetWatcher();
        this.setWatcher();
        this.emitevent("pong");
    }
    protected onconnect(): void {
        this._healthy = "health";
        TIANYU.lifecycle.join(this);
        this.setWatcher();
        this.emitevent("connect");
    }

    private onerror(error: Error): void {
        this.emitevent("error", error);
    }
    private onclose(): void {
        this._healthy = "died";
        this.resetWatcher();
        TIANYU.lifecycle.leave(this.id);
        this.emitevent("close");
    }

    private emitevent(event: SocketClientEventEmitKeys<EMIT_MAP>, ...args: any[]): void {
        if (this._listeners[event]) {
            const listeners = [...this._listeners[event].on, ...this._listeners[event].once];
            this._listeners[event].once = [];

            listeners.forEach((cb) => this.callFun(cb, ...args));
        }
    }

    private callFun(cb: any, ...args: any[]): void {
        if (typeof cb === "function") {
            (cb as Function)(...args);
        }
    }

    private async watcherHandler(): Promise<void> {
        this._watcher = null;
        if (this._healthy === "died") {
            void this.close();
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
                        `client/${this._type}`,
                        MessageBundle.text(
                            "ERROR_MODULES_NET_SOCKET_AUTO_HEARTBEAT_FAILED",
                            this._type,
                            this.remote.address,
                            this.remote.port,
                        ),
                    );
            },
        );
    }
}

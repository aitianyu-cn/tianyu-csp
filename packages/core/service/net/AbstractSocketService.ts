/** @format */

import { CallbackAction, guid } from "@aitianyu.cn/types";
import {
    DEFAULT_SOCKET_SERVICE_ADDR,
    IScoketServiceOption,
    ISocketAddress,
    ISocketConnectionRequest,
    ISocketService,
    SocketProtocal,
} from "#interface";
import { AbstractService } from "./AbstractService";
import { MessageBundle } from "#base/res/InternalMessageBundle";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { ErrorHelper } from "#utils";

export interface SocketListenerItem<T> {
    on: T[];
    once: T[];
}

export interface SocketEventMapSrc {
    connect: (id: string, request: ISocketConnectionRequest & any) => void;
    message: (id: string, data: Buffer, isBinary: boolean) => void;
    error: (id: string, error: Error) => void;
    ping: (id: string) => void;
    pong: (id: string) => void;
    close: (id: string, code: number, reason: Buffer) => void;
}

export type SocketEventEmitKeys<MAP extends SocketEventMapSrc> = keyof MAP;
export type SocketEventEmitEventCB<MAP extends SocketEventMapSrc, K extends SocketEventEmitKeys<MAP>> = MAP[K];

export type SocketListener<MAP extends SocketEventMapSrc> = Record<
    SocketEventEmitKeys<MAP>,
    SocketListenerItem<SocketEventEmitEventCB<MAP, SocketEventEmitKeys<MAP>>>
>;

export interface ISocketServiceServer {
    on(event: string | symbol, cb: Function): this;
    close(callback?: (err?: Error) => void): void;
}

export interface ISocketConnection {
    status: number;
    close(): void;
}

export interface ISocketConnectionMapItem<SOCKET_TYPE extends ISocketConnection> {
    connection: SOCKET_TYPE;
    last: number;
    flag: "active" | "free" | "deid";
    remote: ISocketAddress;
}

/** Abstract Class for all Socket Service */
export abstract class AbstractSocketService<
        SOCKET_TYPE extends ISocketConnection,
        SOCKET_RAW,
        EMIT_MAP extends SocketEventMapSrc,
        REQ extends ISocketConnectionRequest | undefined,
    >
    extends AbstractService<SocketProtocal>
    implements ISocketService
{
    /** Socket Service Id */
    private _serviceId: string;
    /** Socket Service Protocal Type */
    private _protocalType: SocketProtocal;
    /** Socket local binding address and port */
    private _address: ISocketAddress;

    /** Socket service instance */
    protected _service: ISocketServiceServer;
    protected _connections: Map<string, ISocketConnectionMapItem<SOCKET_TYPE>>;
    protected _listeners: Partial<SocketListener<EMIT_MAP>>;

    protected _listeningPromise: Promise<void>;

    protected onError?: (remote: ISocketAddress | null, error: Error) => void;
    protected clientIdGenerator?: (remote: ISocketAddress, req: REQ) => string;

    private _watchTimeout: number;
    private _watcher?: NodeJS.Timeout;
    private _autoPing: boolean;

    protected _autoPong: boolean;

    /**
     * To create a specified socket service with given protocal and address
     *
     * @param protocalType Socket protocal type
     * @param address local binding address and port, default socket address and port will be applied if no address assigned
     */
    public constructor(
        service: ISocketServiceServer,
        protocalType: SocketProtocal,
        address?: ISocketAddress,
        option?: IScoketServiceOption<REQ>,
    ) {
        super();

        this._service = service;
        this._serviceId = guid();
        this._protocalType = protocalType;
        this._address = address || DEFAULT_SOCKET_SERVICE_ADDR;

        this.onError = option?.error;
        this.clientIdGenerator = option?.clientIdGenerator;

        this._listeners = {};
        this._connections = new Map<string, ISocketConnectionMapItem<SOCKET_TYPE>>();

        this._watchTimeout = option?.timeout || AbstractSocketService.DEFAULT_TIMEOUT_TIME;
        this._watcher = undefined;
        this._autoPing = !!option?.autoPing;
        this._autoPong = !!option?.autoPong;

        this._service.on("connection", this.onconnection.bind(this));
        this._service.on("error", this.onservererror.bind(this));
        this._listeningPromise = new Promise<void>((resolve) => {
            this._service.on("listening", () => {
                resolve();
            });
        });
    }

    public get id(): string {
        return this._serviceId;
    }
    public get type(): SocketProtocal {
        return this._protocalType;
    }
    /** Get current service binding host */
    public get host(): string {
        return this._address.address;
    }
    /** Get current service binding port */
    public get port(): number {
        return this._address.port;
    }
    /** Get current clients list */
    public get clients(): string[] {
        const client: string[] = [];
        for (const key of this._connections.keys()) {
            client.push(key);
        }
        return client;
    }
    /** Waiting for Web Socket instance starting done */
    public async starting(): Promise<void> {
        await this._listeningPromise;
    }
    public on<E extends SocketEventEmitKeys<EMIT_MAP>>(event: E, cb: SocketEventEmitEventCB<EMIT_MAP, E>): this {
        if (!this._listeners[event]) {
            this._listeners[event] = { on: [], once: [] };
        }

        this._listeners[event].on.push(cb);
        return this;
    }
    public once<E extends SocketEventEmitKeys<EMIT_MAP>>(event: E, cb: SocketEventEmitEventCB<EMIT_MAP, E>): this {
        if (!this._listeners[event]) {
            this._listeners[event] = { on: [], once: [] };
        }

        this._listeners[event].once.push(cb);
        return this;
    }
    /**
     * To close a socket service, when the service is closed, the callback function will be invoked.
     *
     * @param callback callback function when the service is close to call
     */
    public async close(callback?: (err?: Error) => void): Promise<void> {
        TIANYU.lifecycle.leave(this.id);

        const oldconns = this._connections;
        this._connections = new Map<string, ISocketConnectionMapItem<SOCKET_TYPE>>();
        for (const conn of oldconns) {
            conn[1].connection.close();
        }
        oldconns.clear();
        this._listeners = {};
        if (this._watcher) {
            clearTimeout(this._watcher);
        }

        return new Promise<void>((resolve, reject) => {
            this._service.close((err) => {
                callback?.(err);
                /* istanbul ignore if */
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * To start a service, when the service is starting listening, the callback function will be invoked.
     *
     * @param callback callback function when the service is starting to listen
     */
    public abstract listen(callback?: CallbackAction): void;

    protected flushconnect(id: string): void {
        const connection = this._connections.get(id);
        if (connection) {
            connection.last = Date.now();
            connection.flag = "active";
        }
    }
    protected onclose(id: string, code: number, reason: Buffer): void {
        if (this._connections.has(id)) {
            this._connections.delete(id);

            if (this._listeners.close) {
                const listeners = [...this._listeners.close.on, ...this._listeners.close.once];
                this._listeners.close.once = [];
                listeners.forEach((cb) => this.callFun(cb, id, code, reason));
            }
        }
    }
    protected onreceive(id: string, data: Buffer, isBinary: boolean): void {
        this.flushconnect(id);

        if (this._listeners.message) {
            const listeners = [...this._listeners.message.on, ...this._listeners.message.once];
            this._listeners.message.once = [];

            listeners.forEach((cb) => this.callFun(cb, id, data, isBinary));
        }
    }
    protected onerror(id: string, error: Error): void {
        if (this._listeners.error) {
            const listeners = [...this._listeners.error.on, ...this._listeners.error.once];
            this._listeners.error.once = [];

            listeners.forEach((cb) => this.callFun(cb, id, error));
        }
    }
    protected onping(id: string): void {
        this.flushconnect(id);

        if (this._listeners.ping) {
            const listeners = [...this._listeners.ping.on, ...this._listeners.ping.once];
            this._listeners.ping.once = [];

            listeners.forEach((cb) => this.callFun(cb, id));
        }
    }
    protected onpong(id: string): void {
        this.flushconnect(id);

        if (this._listeners.pong) {
            const listeners = [...this._listeners.pong.on, ...this._listeners.pong.once];
            this._listeners.pong.once = [];

            listeners.forEach((cb) => this.callFun(cb, id));
        }
    }
    protected abstract sendData(socket: SOCKET_RAW, data: Buffer): Promise<void>;
    protected abstract sendPing(connection: SOCKET_TYPE): Promise<void>;
    protected abstract sendPong(connection: SOCKET_TYPE): Promise<void>;
    protected abstract checkClosed(status: number): boolean;
    protected abstract handleConnection(id: string, socket: SOCKET_RAW, request: REQ): SOCKET_TYPE;
    protected abstract handleClose(socket: SOCKET_RAW): void;
    protected abstract handleRemote(socket: SOCKET_RAW, request: REQ): ISocketAddress;

    public static DEFAULT_TIMEOUT_TIME: number = 30000;

    private async onwatch(): Promise<void> {
        this._watcher = undefined;

        await this.watchflag();

        // release thread to avoid wrong operation
        setTimeout(() => {
            if (!this._watcher && this._connections.size) {
                this._watcher = setTimeout(this.onwatch.bind(this), this._watchTimeout / 2);
            }
        }, 0);
    }
    private async watchflag(): Promise<void> {
        const time = Date.now();
        const conns: string[] = [];
        // cache keys before to reget connection instance
        for (const key of this._connections.keys()) {
            conns.push(key);
        }

        // loop connection by keys to avoid dynamic connection deletion or increase
        conns.forEach((key) => {
            const value = this._connections.get(key);
            if (value) {
                if (time - value.last >= this._watchTimeout) {
                    value.flag = value.flag === "active" ? "free" : "deid";
                }
                if (this.checkClosed(value.connection.status)) {
                    value.flag = "deid";
                }
                if (value.flag === "deid") {
                    value.connection.close();
                } else if (this._autoPing && value.flag === "free") {
                    void this.sendPing(value.connection).catch((error) => {
                        this.onError?.(value.remote, error instanceof Error ? error : new Error(`ping client ${key} failed`));
                    });
                }
            }
        });
    }
    private onservererror(error: Error): void {
        const msg = MessageBundle.text("ERROR_CORE_SERVICE_NET_SOCKET_SERVER_ERROR", this.id, error.message);
        void TIANYU.audit.error(this.app, msg, ErrorHelper.getError(SERVICE_ERROR_CODES.INTERNAL_ERROR, msg, error.stack));
        this.onError?.(null, error);
    }
    private async onconnection(socket: SOCKET_RAW, request: REQ): Promise<void> {
        const id = (this.clientIdGenerator || guid)(
            {
                address: request?.socket.remoteAddress || "",
                port: request?.socket.remotePort || 0,
            },
            request,
        );

        if (!id) {
            await this.handleInvalidConnection(socket, request);
            return;
        }

        if (this._connections.has(id)) {
            await this.handleDuplicatedConnection(id, socket, request);
            return;
        }

        this._connections.set(id, {
            connection: this.handleConnection(id, socket, request),
            last: Date.now(),
            flag: "active",
            remote: this.handleRemote(socket, request),
        });

        const listeners = [...(this._listeners.connect?.on || []), ...(this._listeners.connect?.once || [])];
        if (this._listeners.connect?.once) {
            this._listeners.connect.once = [];
        }

        listeners.forEach((cb) => this.callFun(cb, id, request));

        if (!this._watcher) {
            this._watcher = setTimeout(this.onwatch.bind(this), this._watchTimeout / 2);
        }
    }
    private async handleDuplicatedConnection(id: string, conn: SOCKET_RAW, request: REQ): Promise<void> {
        await this.sendData(
            conn,
            Buffer.from(
                ErrorHelper.getErrorString(
                    SERVICE_ERROR_CODES.INTERNAL_ERROR,
                    MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVICE_DUPLICATED_CONNECTION"),
                    MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVICE_DUPLICATED_CONNECTION_DET"),
                ),
                "utf-8",
            ),
        );
        this.handleClose(conn);
        this.onError?.(
            this.handleRemote(conn, request),
            new Error(MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVICE_DUPLICATED_CONNECTION_ERR", id)),
        );
    }
    private async handleInvalidConnection(conn: SOCKET_RAW, request: REQ): Promise<void> {
        await this.sendData(
            conn,
            Buffer.from(
                ErrorHelper.getErrorString(
                    SERVICE_ERROR_CODES.INTERNAL_ERROR,
                    MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVICE_INVALID_USER"),
                    MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVICE_INVALID_USER_DET"),
                ),
                "utf-8",
            ),
        );
        this.handleClose(conn);
        this.onError?.(
            this.handleRemote(conn, request),
            new Error(MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVICE_INVALID_USER_ERR")),
        );
    }

    private callFun(cb: any, ...args: any[]): void {
        if (typeof cb === "function") {
            (cb as Function)(...args);
        }
    }
}

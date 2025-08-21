/** @format */

import { RawData, WebSocket, WebSocketServer } from "ws";
import { CallbackAction, guid } from "@aitianyu.cn/types";
import { AbstractSocketService } from "./AbstractSocketService";
import { ISocketAddress, IWebsocketServerOption, IWSClientSendOption, IWSServerConnection } from "#interface";
import { IncomingMessage } from "http";
import { ErrorHelper } from "#utils";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { WebsocketConnection } from "./WebsocketConnection";
import { MessageBundle } from "#base/res/InternalMessageBundle";

interface WebSocketConnect {
    connection: IWSServerConnection;
    last: number;
    flag: "active" | "free" | "deid";
    remote: ISocketAddress;
}

interface WebSocketListenerItem<T extends Function> {
    on: T[];
    once: T[];
}

interface WebSocketEventEmitMap {
    message: (id: string, data: RawData, isBinary: boolean) => void;
    error: (id: string, error: Error) => void;
    ping: (id: string) => void;
    pong: (id: string) => void;
    close: (id: string, code: number, reason: Buffer) => void;
    connect: (id: string, request: IncomingMessage) => void;
}

type EventEmitKeys = keyof WebSocketEventEmitMap;
type EventEmitEventCB<K extends EventEmitKeys> = WebSocketEventEmitMap[K];

interface WebSocketListener extends Record<EventEmitKeys, WebSocketListenerItem<EventEmitEventCB<EventEmitKeys>>> {
    message: WebSocketListenerItem<EventEmitEventCB<"message">>;
    error: WebSocketListenerItem<EventEmitEventCB<"error">>;
    ping: WebSocketListenerItem<EventEmitEventCB<"ping">>;
    pong: WebSocketListenerItem<EventEmitEventCB<"pong">>;
    close: WebSocketListenerItem<EventEmitEventCB<"close">>;
    connect: WebSocketListenerItem<EventEmitEventCB<"connect">>;
}

/** Web Socket Server */
export class WebsocketService extends AbstractSocketService {
    protected declare _service: WebSocketServer;

    private _connections: Map<string, WebSocketConnect>;
    private _listeners: WebSocketListener;

    private _listeningPromise: Promise<void>;

    private onError?: (remote: ISocketAddress | null, error: Error) => void;
    private clientIdGenerator?: (remote: ISocketAddress, req: IncomingMessage) => string;

    private _watchTimeout: number;
    private _watcher?: NodeJS.Timeout;
    private _autoPing: boolean;

    /**
     * Create a new Server.
     * Server will be starting automatically if te option.noServer is undefined or false.
     *
     * @param address local binding ip and port
     * @param option web socket option
     */
    public constructor(address?: ISocketAddress, option?: IWebsocketServerOption) {
        super(
            new WebSocketServer({
                ...option,
                host: address?.address,
                port: address?.port,
            }),
            "ws",
            address,
        );

        this.onError = option?.error;
        this.clientIdGenerator = option?.clientIdGenerator;

        this._connections = new Map<string, WebSocketConnect>();
        this._listeners = {
            message: { on: [], once: [] },
            error: { on: [], once: [] },
            ping: { on: [], once: [] },
            pong: { on: [], once: [] },
            close: { on: [], once: [] },
            connect: { on: [], once: [] },
        };
        this._watchTimeout = option?.timeout || WebsocketService.DEFAULT_TIMEOUT_TIME;
        this._watcher = undefined;
        this._autoPing = !!option?.autoPing;

        this._service.on("connection", this.onconnection.bind(this));
        this._service.on("error", this.onservererror.bind(this));

        this._listeningPromise = new Promise<void>((resolve) => {
            this._service.on("listening", () => {
                resolve();
            });
        });
    }
    public override async close(callback?: (err?: Error) => void): Promise<void> {
        const oldconns = this._connections;
        this._connections = new Map<string, WebSocketConnect>();
        for (const conn of oldconns) {
            conn[1].connection.close();
        }
        oldconns.clear();
        this._listeners = {
            message: { on: [], once: [] },
            error: { on: [], once: [] },
            ping: { on: [], once: [] },
            pong: { on: [], once: [] },
            close: { on: [], once: [] },
            connect: { on: [], once: [] },
        };
        await super.close(callback);
        if (this._watcher) {
            clearTimeout(this._watcher);
        }
    }
    /** Waiting for Web Socket instance starting done */
    public async starting(): Promise<void> {
        await this._listeningPromise;
    }
    /**
     * Send a ping to specified client
     *
     * @param id client id
     */
    public async ping(id: string): Promise<void> {
        const connection = this._connections.get(id);
        if (connection) {
            await connection.connection.ping();
        }
    }
    /**
     * Send a pong to specified client
     *
     * @param id client id
     */
    public async pong(id: string): Promise<void> {
        const connection = this._connections.get(id);
        if (connection) {
            await connection.connection.pong();
        }
    }
    /**
     * Send a message to specified client
     *
     * @param id client id
     * @param message message to send
     * @param option message sending option
     */
    public async post(id: string, message: any, option?: IWSClientSendOption): Promise<void> {
        const connection = this._connections.get(id);
        if (connection) {
            await connection.connection.post(message, option);
        }
    }
    /**
     * Setup a listener on event
     *
     * @param event event type
     * @param cb callbase function when event occur
     * @returns return an instance of current
     */
    public on<T extends EventEmitKeys>(event: T, cb: EventEmitEventCB<T>): this {
        switch (event) {
            case "close":
                this._listeners.close.on.push(cb as EventEmitEventCB<"close">);
                break;
            case "connect":
                this._listeners.connect.on.push(cb as EventEmitEventCB<"connect">);
                break;
            case "error":
                this._listeners.error.on.push(cb as EventEmitEventCB<"error">);
                break;
            case "message":
                this._listeners.message.on.push(cb as EventEmitEventCB<"message">);
                break;
            case "ping":
                this._listeners.ping.on.push(cb as EventEmitEventCB<"ping">);
                break;
            case "pong":
                this._listeners.pong.on.push(cb as EventEmitEventCB<"pong">);
                break;
            default:
                break;
        }

        return this;
    }
    /**
     * Setup a listener on event, the listener will be removed when the event is triggered
     *
     * @param event event type
     * @param cb callbase function when event occur
     * @returns return an instance of current
     */
    public once<T extends EventEmitKeys>(event: T, cb: EventEmitEventCB<T>): this {
        switch (event) {
            case "close":
                this._listeners.close.once.push(cb as EventEmitEventCB<"close">);
                break;
            case "connect":
                this._listeners.connect.once.push(cb as EventEmitEventCB<"connect">);
                break;
            case "error":
                this._listeners.error.once.push(cb as EventEmitEventCB<"error">);
                break;
            case "message":
                this._listeners.message.once.push(cb as EventEmitEventCB<"message">);
                break;
            case "ping":
                this._listeners.ping.once.push(cb as EventEmitEventCB<"ping">);
                break;
            case "pong":
                this._listeners.pong.once.push(cb as EventEmitEventCB<"pong">);
                break;
            default:
                break;
        }

        return this;
    }
    /** Get current clients list */
    public get clients(): string[] {
        const client: string[] = [];
        for (const key of this._connections.keys()) {
            client.push(key);
        }
        return client;
    }

    private onconnection(websocket: WebSocket, request: IncomingMessage): void {
        const id = this.processConnection(websocket, request);

        if (id) {
            const listeners = [...this._listeners.connect.on, ...this._listeners.connect.once];
            this._listeners.connect.once = [];

            listeners.forEach((cb) => cb(id, request));
        }

        if (!this._watcher) {
            this._watcher = setTimeout(this.onwatch.bind(this), this._watchTimeout / 2);
        }
    }
    private handleDuplicatedConnection(id: string, conn: WebSocket, request: IncomingMessage): void {
        conn.send(
            ErrorHelper.getErrorString(
                SERVICE_ERROR_CODES.INTERNAL_ERROR,
                MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVICE_DUPLICATED_CONNECTION"),
                MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVICE_DUPLICATED_CONNECTION_DET"),
            ),
        );
        conn.close();
        this.onError?.(
            { address: request.socket.remoteAddress || "", port: request.socket.remotePort || 0 },
            new Error(MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVICE_DUPLICATED_CONNECTION_ERR", id)),
        );
    }
    private handleInvalidConnection(conn: WebSocket, request: IncomingMessage): void {
        conn.send(
            ErrorHelper.getErrorString(
                SERVICE_ERROR_CODES.INTERNAL_ERROR,
                MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVICE_INVALID_USER"),
                MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVICE_INVALID_USER_DET"),
            ),
        );
        conn.close();
        this.onError?.(
            { address: request.socket.remoteAddress || "", port: request.socket.remotePort || 0 },
            new Error(MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVICE_INVALID_USER_ERR")),
        );
    }
    private onservererror(error: Error): void {
        const msg = MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVER_ERROR", this.id, error.message);
        void TIANYU.audit.error(this.app, msg, ErrorHelper.getError(SERVICE_ERROR_CODES.INTERNAL_ERROR, msg, error.stack));
        this.onError?.(null, error);
    }
    private processConnection(websocket: WebSocket, request: IncomingMessage): string {
        const id = (this.clientIdGenerator || guid)(
            {
                address: request.socket.remoteAddress || "",
                port: request.socket.remotePort || 0,
            },
            request,
        );

        if (!id) {
            this.handleInvalidConnection(websocket, request);
            return "";
        }

        if (this._connections.has(id)) {
            this.handleDuplicatedConnection(id, websocket, request);
            return "";
        }

        const connection: IWSServerConnection = new WebsocketConnection(id, websocket, request);
        connection.on("close", this.onclose.bind(this, id));
        connection.on("error", this.onerror.bind(this, id));
        connection.on("message", this.onreceive.bind(this, id));
        connection.on("ping", this.onping.bind(this, id));
        connection.on("pong", this.onpong.bind(this, id));

        this._connections.set(id, {
            connection,
            last: Date.now(),
            flag: "active",
            remote: {
                address: request.socket.remoteAddress || "",
                port: request.socket.remotePort || 0,
            },
        });
        return id;
    }

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
                if (value.connection.status === WebSocket.CLOSED || value.connection.status === WebSocket.CLOSING) {
                    value.flag = "deid";
                }
                if (value.flag === "deid") {
                    value.connection.close();
                } else if (this._autoPing && value.flag === "free") {
                    void value.connection.ping().catch((error) => {
                        this.onError?.(value.remote, error instanceof Error ? error : new Error(`ping client ${key} failed`));
                    });
                }
            }
        });
    }

    private onclose(id: string, code: number, reason: Buffer): void {
        if (this._connections.has(id)) {
            this._connections.delete(id);

            const listeners = [...this._listeners.close.on, ...this._listeners.close.once];
            this._listeners.close.once = [];

            listeners.forEach((cb) => cb(id, code, reason));
        }
    }
    private onreceive(id: string, data: RawData, isBinary: boolean): void {
        this.flushconnect(id);

        const listeners = [...this._listeners.message.on, ...this._listeners.message.once];
        this._listeners.message.once = [];

        listeners.forEach((cb) => cb(id, data, isBinary));
    }
    private onerror(id: string, error: Error): void {
        const listeners = [...this._listeners.error.on, ...this._listeners.error.once];
        this._listeners.error.once = [];

        listeners.forEach((cb) => cb(id, error));
    }
    private onping(id: string): void {
        this.flushconnect(id);

        const listeners = [...this._listeners.ping.on, ...this._listeners.ping.once];
        this._listeners.ping.once = [];

        listeners.forEach((cb) => cb(id));
    }
    private onpong(id: string): void {
        this.flushconnect(id);

        const listeners = [...this._listeners.pong.on, ...this._listeners.pong.once];
        this._listeners.pong.once = [];

        listeners.forEach((cb) => cb(id));
    }

    private flushconnect(id: string): void {
        const connection = this._connections.get(id);
        if (connection) {
            connection.last = Date.now();
            connection.flag = "active";
        }
    }

    public static DEFAULT_TIMEOUT_TIME: number = 30000;

    /** @deprecated Use starting instead */
    public listen(_callback?: CallbackAction): void {
        throw ErrorHelper.getError(
            SERVICE_ERROR_CODES.INTERNAL_ERROR,
            MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVER_LISTEN", this.id, this.host, this.port),
            MessageBundle.text("ERROR_CORE_SERVICE_NET_WEBSOCKET_SERVER_LISTEN_DET"),
        );
    }
}

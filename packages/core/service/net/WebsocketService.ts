/** @format */

import { WebSocket, WebSocketServer } from "ws";
import { CallbackAction } from "@aitianyu.cn/types";
import { AbstractSocketService, SocketEventMapSrc } from "./AbstractSocketService";
import { ISocketAddress, IWebsocketServerOption, IWSClientSendOption, IWSServerConnection } from "#interface";
import { IncomingMessage } from "http";
import { ErrorHelper } from "#utils";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { MessageBundle } from "#base/res/InternalMessageBundle";
import { WebsocketConnection } from "./WebsocketConnection";

/** Web Socket Server */
export class WebsocketService extends AbstractSocketService<IWSServerConnection, WebSocket, SocketEventMapSrc, IncomingMessage> {
    protected declare _service: WebSocketServer;

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
            option,
        );
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

    protected async sendData(socket: WebSocket, data: Buffer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            socket.send(data, (error?: Error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
    protected async sendPing(socket: IWSServerConnection): Promise<void> {
        await socket.ping();
    }
    protected async sendPong(socket: IWSServerConnection): Promise<void> {
        await socket.pong();
    }
    protected checkClosed(status: number): boolean {
        return status === WebSocket.CLOSED || status === WebSocket.CLOSING;
    }
    protected handleConnection(id: string, socket: WebSocket, request: IncomingMessage): IWSServerConnection {
        const connection: IWSServerConnection = new WebsocketConnection(id, socket, request);
        connection.on("close", this.onclose.bind(this, id));
        connection.on("error", this.onerror.bind(this, id));
        connection.on("message", this.onreceive.bind(this, id));
        connection.on("ping", this.onping.bind(this, id));
        connection.on("pong", this.onpong.bind(this, id));
        return connection;
    }
    protected handleClose(socket: WebSocket): void {
        socket.close();
    }
    protected handleRemote(_socket: WebSocket, request: IncomingMessage): ISocketAddress {
        return { address: request.socket.remoteAddress || "", port: request.socket.remotePort || 0 };
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

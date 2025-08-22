/** @format */

import net from "net";
import { ISocketAddress, ISocketConnectionRequest, ITcpServiceOption } from "#interface";
import { CallbackAction } from "@aitianyu.cn/types";
import { AbstractSocketService, ISocketConnection, SocketEventMapSrc } from "./AbstractSocketService";

interface TcpConnectionEmitMap extends SocketEventMapSrc {}

class SocketConnection implements ISocketConnection {
    private socket: net.Socket;

    public constructor(socket: net.Socket) {
        this.socket = socket;
    }

    /* istanbul ignore next */
    public get status(): number {
        return this.socket.closed || this.socket.destroyed ? 1 : 0;
    }

    public close(): void {
        this.socket.destroy();
    }

    public get connection(): net.Socket {
        return this.socket;
    }
}

/** TCP service */
export class TcpService extends AbstractSocketService<
    SocketConnection,
    net.Socket,
    TcpConnectionEmitMap,
    ISocketConnectionRequest
> {
    protected declare _service: net.Server;

    private pingMsg: string;
    private pongMsg: string;

    /**
     * To create a new TCP service instance with given local binding address
     *
     * @param address local binding address, default address will be applied when the address is undefined.
     *                default address default is "0.0.0.0" and the port is a random number from 1024 to 65535
     */
    public constructor(address?: ISocketAddress, option?: ITcpServiceOption) {
        super(net.createServer(), "tcp", address, option);

        this.pingMsg = option?.pingMsg || TcpService.DEFAULT_PING;
        this.pongMsg = option?.pongMsg || TcpService.DEFAULT_PONG;
    }

    /** Get a value indicates the service is in running status */
    public get listening(): boolean {
        return this._service.listening;
    }

    public listen(callback?: CallbackAction): void {
        this._service.listen(this.port, this.host, () => {
            TIANYU.lifecycle.join(this);
            callback?.();
        });
    }

    public override async close(callback?: (err?: Error) => void): Promise<void> {
        if (!this.listening) {
            callback?.();
            return;
        }

        await super.close(callback);
    }

    /**
     * Send a message to specified client
     *
     * @param id client id
     * @param message message to send
     */
    public async post(id: string, message: Buffer): Promise<void> {
        const connection = this._connections.get(id);
        if (connection) {
            await this.sendData(connection.connection.connection, message);
        }
    }

    public async ping(id: string): Promise<void> {
        const connection = this._connections.get(id);
        if (connection) {
            await this.sendPing(connection.connection);
        }
    }

    public async pong(id: string): Promise<void> {
        const connection = this._connections.get(id);
        if (connection) {
            await this.sendPong(connection.connection);
        }
    }

    protected async sendData(socket: net.Socket, data: Buffer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            socket.write(data, (error?: Error | null) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
    protected async sendPing(connection: SocketConnection): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            connection.connection.write(Buffer.from(this.pingMsg), (error?: Error | null) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
    protected async sendPong(connection: SocketConnection): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            connection.connection.write(Buffer.from(this.pongMsg), (error?: Error | null) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
    protected checkClosed(status: number): boolean {
        return status === 1;
    }
    protected handleConnection(id: string, socket: net.Socket, _request: ISocketConnectionRequest): SocketConnection {
        socket.on("close", this.oncloseV2.bind(this, id));
        socket.on("data", this.onmessage.bind(this, id));
        socket.on("error", this.onerror.bind(this, id));

        return new SocketConnection(socket);
    }
    protected handleClose(socket: net.Socket): void {
        socket.destroy();
    }
    protected handleRemote(socket: net.Socket): ISocketAddress {
        return {
            address: socket.remoteAddress || /* istanbul ignore next */ "",
            port: socket.remotePort || /* istanbul ignore next */ 0,
        };
    }

    private onmessage(id: string, data: Buffer): void {
        const d2s = data.toString("utf-8");
        if (d2s === this.pingMsg) {
            this.handlePing(id);
        } else if (d2s === this.pongMsg) {
            this.onpong(id);
        } else {
            super.onreceive(id, data, false);
        }
    }
    private oncloseV2(id: string, hadError: boolean): void {
        this.onclose(id, hadError ? /* istanbul ignore next */ -1 : 0, Buffer.from(""));
    }

    private handlePing(id: string): void {
        if (this._autoPong) {
            const connection = this._connections.get(id);
            connection &&
                void this.sendPong(connection.connection).catch((error) => {
                    this.onError?.(connection.remote, error);
                });
        }
        this.onping(id);
    }

    public static DEFAULT_PING: string = "PING";
    public static DEFAULT_PONG: string = "PONG";
}

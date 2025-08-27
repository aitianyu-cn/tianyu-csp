/** @format */

import { MessageBundle } from "#base/res/InternalMessageBundle";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { TcpService } from "#core/service/net/TcpService";
import { ISocketAddress, TcpClientOptions } from "#interface";
import { ErrorHelper } from "#utils";
import net from "net";
import { IReleasable } from "packages/interface/api/lifecycle";
import { AbstractSocketClient } from "./AbstractSocketClient";

/** TCP Client */
export class TcpClient extends AbstractSocketClient<net.Socket> implements IReleasable {
    private _pingMsg: string;
    private _pongMsg: string;

    /**
     * To create a TCP client instance
     *
     * @param options client creation option
     */
    public constructor(options: TcpClientOptions) {
        super("tcp", new net.Socket(), options);

        this._pingMsg = options.pingMsg || TcpService.DEFAULT_PING;
        this._pongMsg = options.pongMsg || TcpService.DEFAULT_PONG;

        this._socket.on("connect", this.onconnect.bind(this));
        this._socket.on("data", this.receiveHandler.bind(this));
    }

    /**
     * Async function to start a connection with specified options
     *
     * @param options TCP socket connection option
     * @returns return a promise
     */
    public connect(options: net.TcpSocketConnectOpts): void {
        const connectionErrorHandler = (error: Error) => {
            const err_msg = MessageBundle.text(
                "ERROR_MODULES_NET_TCP_CONNECTION_ERROR",
                String(options.host),
                String(options.port),
                error.message,
            );
            const err = ErrorHelper.getError(SERVICE_ERROR_CODES.INTERNAL_ERROR, err_msg, error.stack);
            this.log && void TIANYU.audit.error("client/tcp", err_msg, err);
        };
        this._socket.once("error", connectionErrorHandler);
        this._socket.connect(options);
    }

    /** To close current connection */
    public async close(): Promise<void> {
        this._socket.destroy();
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

    /**
     * To send a connection ping
     *
     * @returns return a promise for pinging done
     */
    public async ping(): Promise<void> {
        return this.sendMessage(Buffer.from(this._pingMsg, "utf-8"), "ERROR_MODULES_NET_TCP_HEARTBEAT_PING_FAILED");
    }
    /**
     * To send a connection pong
     *
     * @returns return a promise for ponging done
     */
    public async pong(): Promise<void> {
        return this.sendMessage(Buffer.from(this._pongMsg, "utf-8"), "ERROR_MODULES_NET_TCP_HEARTBEAT_PONG_FAILED");
    }

    private async sendMessage(data: Buffer, key: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._socket.write(data, (error?: Error | null) => {
                if (error) {
                    const err_msg = MessageBundle.text(
                        key,
                        String(this.remote.address),
                        String(this.remote.port),
                        data.toString("utf-8"),
                        error?.message,
                    );
                    const err = ErrorHelper.getError(SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR, err_msg, error?.stack);
                    this.log && void TIANYU.audit.error("client/tcp", err_msg, err);

                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    protected get remote(): ISocketAddress {
        return { address: this._socket.remoteAddress || "", port: this._socket.remotePort || 0 };
    }

    private receiveHandler(data: Buffer): void {
        const toStr = data.toString("utf-8");
        if (toStr === this._pingMsg) {
            this.onping();
        } else if (toStr === this._pongMsg) {
            this.onpong();
        } else {
            this.onmessage?.(data);
        }
    }
}

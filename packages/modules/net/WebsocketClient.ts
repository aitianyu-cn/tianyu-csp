/** @format */

import { IReleasable, ISocketAddress, ISocketLongConnectionOption, IWSClientSendOption, SocketClientOptions } from "#interface";
import { ClientRequestArgs } from "http";
import { ClientOptions, WebSocket } from "ws";
import { AbstractSocketClient } from "./AbstractSocketClient";

/** Web Socket Client */
export class WebsocketClient extends AbstractSocketClient<WebSocket> implements IReleasable {
    private _address: ISocketAddress;
    /**
     * Create a Web Socket Instance
     *
     * @param address remote server address
     * @param protocols connection protocols defines
     * @param options client options
     */
    public constructor(
        address: string | URL,
        protocols?: string | string[],
        options?: ISocketLongConnectionOption & SocketClientOptions & (ClientOptions | ClientRequestArgs),
    ) {
        super("ws", new WebSocket(address, protocols, options), options);

        this._address =
            typeof address === "string"
                ? WebsocketClient.handleURL(address)
                : {
                      address: address.href,
                      port: 80,
                  };

        this._socket.on("message", this.onmessage.bind(this));
        this._socket.on("ping", this.onping.bind(this));
        this._socket.on("pong", this.onpong.bind(this));
        this._socket.on("open", this.onconnect.bind(this));
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

    protected get remote(): ISocketAddress {
        return this._address;
    }

    private static handleURL(url: string): ISocketAddress {
        const paire = url.split(":");
        const herf = paire.slice(0, paire.length - 1);
        const port = Number(paire[paire.length - 1]);
        return { address: herf.join(":"), port: Number.isInteger(port) ? port : 80 };
    }
}

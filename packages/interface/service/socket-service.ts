/** @format */

import { INetworkService } from "./service";
import { Integer } from "#base/index";
import { PerMessageDeflateOptions, VerifyClientCallbackAsync, VerifyClientCallbackSync } from "ws";
import { IncomingMessage } from "http";

/** Socket Protocal Type: TCP or UDP */
export type SocketProtocal = "tcp" | "udp" | "ws";

/** Socket IP address Family */
export type SocketAddressFamily = "IPv4" | "IPv6";

/** Socket Service Common Interface */
export interface ISocketService extends INetworkService<SocketProtocal> {}

/** Socket Addresss */
export interface ISocketAddress {
    /** IP address */
    address: string;
    /** IP port */
    port: number;
}

/** Web Socket Server Connection Instance */
export interface IWSServerConnection {
    /** Get the current status of connection */
    status: 0 | 1 | 2 | 3;
    /**
     * Setup a listener for message and the callback function will be invoked when server receives client data
     *
     * @param event message
     * @param cb callback function
     */
    on(event: "message", cb: (message: Buffer, isBinary: boolean) => void): this;
    /**
     * Setup a listener for error and the callback function will be invoked when server receives an error
     *
     * @param event error
     * @param cb callback function
     */
    on(event: "error", cb: (error: Error) => void): this;
    /**
     * Setup a listener for ping and the callback function will be invoked when server receives client ping
     *
     * @param event ping
     * @param cb callback function
     */
    on(event: "ping", cb: (data: Buffer) => void): this;
    /**
     * Setup a listener for pong and the callback function will be invoked when server receives client pong
     *
     * @param event pong
     * @param cb callback function
     */
    on(event: "pong", cb: (data: Buffer) => void): this;
    /**
     * Setup a listener for connection closed and the callback function will be invoked when server connection closed
     *
     * @param event close
     * @param cb callback function
     */
    on(event: "close", cb: (code: number, reason: Buffer) => void): this;
    /**
     * interface to post a message to client
     *
     * @param message message data to post
     * @param option data sending option
     */
    post(message: any, option?: IWSClientSendOption): Promise<void>;
    /**
     * interface to post a message to client
     *
     * @param data message data to post
     * @param mask enable data encrypto
     */
    ping(data?: any, mask?: boolean): Promise<void>;
    /**
     * interface to post a message to client
     *
     * @param data message data to post
     * @param mask enable data encrypto
     */
    pong(data?: any, mask?: boolean): Promise<void>;
    /**
     * To close a socket connection.
     * When invoke this close function, the manager unregister will be invoked.
     */
    close(): void;
}

export interface IScoketServiceOption<REQ extends ISocketConnectionRequest | undefined> {
    autoPong?: boolean;
    /** Set auto to ping the client for keeping long connection life */
    autoPing?: boolean;
    /** Connection keeplive time for sending ping message timely */
    timeout?: number;
    /** Function to generate client id */
    clientIdGenerator?: (remote: ISocketAddress, req: REQ) => string;
    /** Function to handle error */
    error?: (remote: ISocketAddress | string | null, error: Error) => void;
}

export interface ISocketConnectionRequest {
    socket: {
        remoteAddress?: string;
        remotePort?: number;
    };
}

export interface ITcpServiceOption extends IScoketServiceOption<ISocketConnectionRequest> {
    pingMsg?: string;
    pongMsg?: string;
}

/** Option for Web Socket Client Sending */
export interface IWSClientSendOption {
    /** flag to enabld the data encrypto */
    mask?: boolean | undefined;
    /** transferred data is binary */
    binary?: boolean | undefined;
    /** support the data zip */
    compress?: boolean | undefined;
    fin?: boolean | undefined;
}

/** Web Socket Server Options */
export interface IWebsocketServerOption<V extends IncomingMessage = IncomingMessage> extends IScoketServiceOption<V> {
    /** Path to allow client to connect */
    path?: string | undefined;
    /** Set auto response the pong when server receives an client ping */
    autoPong?: boolean | undefined;
    /** Support the server not to start a network listening */
    noServer?: boolean | undefined;
    /** Support the message zip */
    perMessageDeflate?: boolean | PerMessageDeflateOptions | undefined;
    /** Function to verify a client connection when connecting */
    verifyClient?: VerifyClientCallbackAsync<V> | VerifyClientCallbackSync<V> | undefined;
    /** Function to handle the connection protocol */
    handleProtocols?: (protocols: Set<string>, request: V) => string | false;
}

/**
 * Default Socket Service Address
 *
 * IP Addresss: 0.0.0.0
 * IP Port: random number from 1024 to 65535
 */
export const DEFAULT_SOCKET_SERVICE_ADDR: ISocketAddress = {
    address: "0.0.0.0",
    port: Integer.random(1024, 65535),
};

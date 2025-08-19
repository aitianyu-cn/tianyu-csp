/** @format */

import { INetworkService } from "./service";
import { Integer } from "#base/index";
import { PerMessageDeflateOptions, RawData, VerifyClientCallbackAsync, VerifyClientCallbackSync } from "ws";
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

export interface IWSServerConnection {
    on(event: "message", cb: (id: string, message: RawData, isBinary: boolean) => void): this;
    on(event: "error", cb: (id: string, error: Error) => void): this;
    on(event: "ping", cb: (id: string, data: Buffer) => void): this;
    post(message: any): Promise<void>;
}

export interface IWSServerRegister {
    (id: string, server: IWSServerConnection): void;
}

export interface IWSServerUnregister {
    (id: string): void;
}

export interface IWebsocketOption<V extends typeof IncomingMessage = typeof IncomingMessage> {
    path?: string | undefined;
    autoPong?: boolean | undefined;
    noServer?: boolean | undefined;
    perMessageDeflate?: boolean | PerMessageDeflateOptions | undefined;
    verifyClient?: VerifyClientCallbackAsync<InstanceType<V>> | VerifyClientCallbackSync<InstanceType<V>> | undefined;
    handleProtocols?: (protocols: Set<string>, request: InstanceType<V>) => string | false;
    clientIdGenerator?: (remote: ISocketAddress, req: IncomingMessage) => string;
    error?: (remote: ISocketAddress | null, error: Error) => void;
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

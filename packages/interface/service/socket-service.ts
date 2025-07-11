/** @format */

import { randomInt } from "crypto";
import { INetworkService } from "./service";

/** Socket Protocal Type: TCP or UDP */
export type SocketProtocal = "tcp" | "udp";

/** Socket IP address Family */
export type SocketAddressFamily = "IPv4" | "IPv6";

/** Socket Service Common Interface */
export interface ISocketService extends INetworkService {
    /** Socket Protocal */
    type: SocketProtocal;
}

/** Socket Addresss */
export interface ISocketAddress {
    /** IP address */
    address: string;
    /** IP port */
    port: number;
}

/**
 * Default Socket Service Address
 *
 * IP Addresss: 0.0.0.0
 * IP Port: random number from 1024 to 65535
 */
export const DEFAULT_SOCKET_SERVICE_ADDR: ISocketAddress = {
    address: "0.0.0.0",
    port: randomInt(1024, 65535),
};

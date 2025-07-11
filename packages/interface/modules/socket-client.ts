/** @format */

import { ISocketAddress, SocketAddressFamily } from "../service/socket-service";

/** Socket Client Configuration Options */
export interface SocketClientOptions {
    log?: boolean;
}

/** UDP Client Options */
export interface UdpClientOptions extends SocketClientOptions {
    /** Remote Connection Address */
    remote: ISocketAddress;
    /** IP Address Family */
    family?: SocketAddressFamily;
    /** Indicates should force waiting response */
    response?: boolean;
}

/** UDP Client Response structure */
export interface UdpClientResponse {
    /** UDP response data */
    data: Buffer;
    /** Remote IP Address */
    remote: ISocketAddress;
}

/** TCP Client Options */
export interface TcpClientOptions extends SocketClientOptions {}

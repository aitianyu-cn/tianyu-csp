/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { ISocketAddress, SocketAddressFamily } from "#interface";
import { ErrorHelper } from "#utils";
import { CallbackAction } from "@aitianyu.cn/types";
import { AbstractSocketService } from "./AbstractSocketService";
import dgram from "dgram";

/** UDP Service */
export class UdpService extends AbstractSocketService {
    private _service: dgram.Socket;
    private _family: SocketAddressFamily;

    /**
     * To create a new UDP service instance with given local binding address and IP family
     *
     * @param address local binding address, default address will be applied when the address is undefined.
     *                default address default is "0.0.0.0" and the port is a random number from 1024 to 65535
     * @param family IP address family includes IPv4 and IPv6
     */
    public constructor(address?: ISocketAddress, family?: SocketAddressFamily) {
        super("udp", address);

        this._family = family || "IPv4";
        this._service = dgram.createSocket(this._family === "IPv6" ? "udp6" : "udp4");

        this.handleService();
    }

    public close(callback?: (err?: Error) => void): void {
        this._service.close(callback);
    }

    public listen(callback?: CallbackAction): void {
        this._service.bind(this.port, this.host, callback);
    }

    private handleService(): void {
        this._service.on("message", async (msg: Buffer, rinfo: dgram.RemoteInfo) => {
            const res = await this.onData?.(
                {
                    address: rinfo.address,
                    port: rinfo.port,
                },
                msg,
            );
            if (res) {
                this._service.send(res, rinfo.port, rinfo.address, (error) => {
                    error &&
                        TIANYU.logger.error(
                            ErrorHelper.getErrorString(
                                SERVICE_ERROR_CODES.INTERNAL_ERROR,
                                `udp-server[${this.id}] error on sending to remote ${rinfo.address}:${rinfo.port} - ${error.message}`,
                                error.stack,
                            ),
                        );
                });
            }
        });

        this._service.on("error", (error: Error) => {
            TIANYU.logger.error(
                ErrorHelper.getErrorString(
                    SERVICE_ERROR_CODES.INTERNAL_ERROR,
                    `tcp-server[${this.id}] error at local[${this.host}:${this.port}] - ${error.message}`,
                    error.stack,
                ),
            );
            this._service.close();
        });
    }
}

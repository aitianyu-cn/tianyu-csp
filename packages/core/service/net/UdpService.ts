/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { ISocketAddress, ISocketService, SocketAddressFamily, SocketProtocal } from "#interface";
import { ErrorHelper } from "#utils";
import { CallbackAction, guid } from "@aitianyu.cn/types";
import dgram from "dgram";
import { MessageBundle } from "#base/res/InternalMessageBundle";
import { AbstractService } from "./AbstractService";

/** UDP Service */
export class UdpService extends AbstractService<SocketProtocal> implements ISocketService {
    private _id: string;
    private _service: dgram.Socket;
    private _address: ISocketAddress;

    public onData?: (remote: ISocketAddress, data: Buffer) => Promise<Buffer | void> | Buffer | void;

    /**
     * To create a new UDP service instance with given local binding address and IP family
     *
     * @param address local binding address, default address will be applied when the address is undefined.
     *                default address default is "0.0.0.0" and the port is a random number from 1024 to 65535
     * @param family IP address family includes IPv4 and IPv6
     */
    public constructor(address: ISocketAddress, family?: SocketAddressFamily) {
        super();

        this._id = guid();
        this._service = dgram.createSocket(family === "IPv6" ? "udp6" : "udp4");
        this._address = address;

        this.handleService();
    }

    public get id(): string {
        return this._id;
    }
    public get type(): SocketProtocal {
        return "udp";
    }
    public get port(): number {
        return this._address.port;
    }

    public get host(): string {
        return this._address.address;
    }
    public async close(callback?: () => void): Promise<void> {
        TIANYU.lifecycle.leave(this.id);
        return new Promise<void>((resolve) => {
            this._service.close(() => {
                callback?.();
                resolve();
            });
        });
    }

    public listen(callback?: CallbackAction): void {
        this._service.bind(this.port, this.host, () => {
            TIANYU.lifecycle.join(this);
            callback?.();
        });
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
                        void TIANYU.audit.error(
                            this.app,
                            MessageBundle.text(
                                "ERROR_CORE_SERVICE_NET_UDP_WRITE_RESPONSE_ERROR",
                                this.id,
                                rinfo.address,
                                rinfo.port,
                                error.message,
                            ),
                            ErrorHelper.getError(
                                SERVICE_ERROR_CODES.INTERNAL_ERROR,
                                MessageBundle.text(
                                    "ERROR_CORE_SERVICE_NET_UDP_WRITE_RESPONSE_ERROR",
                                    this.id,
                                    rinfo.address,
                                    rinfo.port,
                                    error.message,
                                ),
                                error.stack,
                            ),
                        );
                });
            }
        });

        this._service.on("error", (error: Error) => {
            void TIANYU.audit.error(
                this.app,
                MessageBundle.text("ERROR_CORE_SERVICE_NET_UDP_GENERAL_ERROR", this.id, this.host, this.port, error.message),
                ErrorHelper.getError(
                    SERVICE_ERROR_CODES.INTERNAL_ERROR,
                    MessageBundle.text("ERROR_CORE_SERVICE_NET_UDP_GENERAL_ERROR", this.id, this.host, this.port, error.message),
                    error.stack,
                ),
            );
            this._service.close();
        });
    }
}

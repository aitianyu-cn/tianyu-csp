/** @format */

import net from "net";
import { ErrorHelper } from "#utils";
import { ISocketAddress } from "#interface";
import { CallbackAction } from "@aitianyu.cn/types";
import { AbstractSocketService } from "./AbstractSocketService";
import { SERVICE_ERROR_CODES } from "#core/Constant";

/** TCP service */
export class TcpService extends AbstractSocketService {
    private _service: net.Server;

    /** Given a function to handle a new TCP connection is established */
    public endConnection?: (remote: ISocketAddress) => void;
    /** Given a function to handle a TCP connection is closed */
    public onConnected?: (remote: ISocketAddress) => void;
    /**
     * Given a function to handle error in TCP service and TCP connection
     *
     * - if "remote" is null, that indicates the error occurs in TCP service
     * - if "remote" is not null, that indicates the error occurs in TCP connection
     */
    public onError?: (remote: ISocketAddress | null, error: Error) => void;

    /**
     * To create a new TCP service instance with given local binding address
     *
     * @param address local binding address, default address will be applied when the address is undefined.
     *                default address default is "0.0.0.0" and the port is a random number from 1024 to 65535
     */
    public constructor(address?: ISocketAddress) {
        super("tcp", address);

        this._service = net.createServer(this.connectionListener.bind(this));

        this._service.on("error", this.errorHandler.bind(this));
    }

    /** Get a value indicates the service is in running status */
    public get listening(): boolean {
        return this._service.listening;
    }

    public close(callback?: (err?: Error) => void): void {
        if (!this.listening) {
            callback?.();
            return;
        }

        this._service.close(callback);
    }

    public listen(callback?: CallbackAction): void {
        this._service.listen(this.port, this.host, callback);
    }

    private connectionListener(socket: net.Socket): void {
        const remoteHost: ISocketAddress = {
            address: socket.remoteAddress || /* istanbul ignore next */ "",
            port: socket.remotePort || /* istanbul ignore next */ 0,
        };

        this.onConnected?.(remoteHost);

        socket.on("data", async (data: Buffer) => {
            const res = await this.onData?.(remoteHost, data);
            if (res) {
                this.sendResponse(socket, res);
            }
        });

        socket.on("end", () => {
            this.endConnection?.(remoteHost);
        });

        socket.on(
            "error",
            /* istanbul ignore next */ (error: Error) => {
                TIANYU.logger.error(
                    ErrorHelper.getErrorString(
                        SERVICE_ERROR_CODES.INTERNAL_ERROR,
                        `tcp-server[${this.id}] error on connection[${remoteHost.address}:${remoteHost.port}] - ${error.message}`,
                        error.stack,
                    ),
                );
                this.onError?.(remoteHost, error);
            },
        );
    }

    private sendResponse(socket: net.Socket, data: Buffer): void {
        socket.write(data, (error?: Error) => {
            error &&
                /* istanbul ignore next */ TIANYU.logger.error(
                    ErrorHelper.getErrorString(
                        SERVICE_ERROR_CODES.INTERNAL_ERROR,
                        `tcp-server[${this.id}] error on sending to remote[${socket.remoteAddress}:${socket.remotePort}] - ${error.message}`,
                        error.stack,
                    ),
                );
        });
    }

    private errorHandler(error: Error): void {
        TIANYU.logger.error(
            ErrorHelper.getErrorString(
                SERVICE_ERROR_CODES.INTERNAL_ERROR,
                `tcp-server[${this.id}] error - ${error.message}`,
                error.stack,
            ),
        );
        this.onError?.(null, error);
    }
}

/** @format */

import { CallbackAction, guid } from "@aitianyu.cn/types";
import { DEFAULT_SOCKET_SERVICE_ADDR, ISocketAddress, ISocketService, SocketProtocal } from "#interface";
import { AbstractService } from "./AbstractService";

export interface ISocketServiceServer {
    close(callback?: (err?: Error) => void): void;
}

/** Abstract Class for all Socket Service */
export abstract class AbstractSocketService extends AbstractService<SocketProtocal> implements ISocketService {
    /** Socket Service Id */
    private _serviceId: string;
    /** Socket Service Protocal Type */
    private _protocalType: SocketProtocal;
    /** Socket local binding address and port */
    private _address: ISocketAddress;

    /** Socket service instance */
    protected _service: ISocketServiceServer;

    /** Given a function to handle TCP service received data, and return the response data if need */
    public onData?: (remote: ISocketAddress, data: Buffer) => Promise<Buffer | void> | Buffer | void;

    /**
     * To create a specified socket service with given protocal and address
     *
     * @param protocalType Socket protocal type
     * @param address local binding address and port, default socket address and port will be applied if no address assigned
     */
    public constructor(service: ISocketServiceServer, protocalType: SocketProtocal, address?: ISocketAddress) {
        super();

        this._service = service;
        this._serviceId = guid();
        this._protocalType = protocalType;
        this._address = address || DEFAULT_SOCKET_SERVICE_ADDR;
    }

    public get id(): string {
        return this._serviceId;
    }
    public get type(): SocketProtocal {
        return this._protocalType;
    }

    /**
     * To close a socket service, when the service is closed, the callback function will be invoked.
     *
     * @param callback callback function when the service is close to call
     */
    public async close(callback?: (err?: Error) => void): Promise<void> {
        TIANYU.lifecycle.leave(this.id);
        return new Promise<void>((resolve, reject) => {
            this._service.close((err) => {
                callback?.(err);
                /* istanbul ignore if */
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    /**
     * To start a service, when the service is starting listening, the callback function will be invoked.
     *
     * @param callback callback function when the service is starting to listen
     */
    public abstract listen(callback?: CallbackAction): void;

    /** Get current service binding host */
    public get host(): string {
        return this._address.address;
    }

    /** Get current service binding port */
    public get port(): number {
        return this._address.port;
    }
}

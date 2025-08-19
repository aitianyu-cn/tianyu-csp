/** @format */

import { WebSocket, WebSocketServer } from "ws";
import { CallbackAction, guid } from "@aitianyu.cn/types";
import { AbstractSocketService } from "./AbstractSocketService";
import { ISocketAddress, IWebsocketOption, IWSServerRegister, IWSServerUnregister } from "#interface";
import { IncomingMessage } from "http";
import { ErrorHelper } from "#utils";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { WebsocketConnectMap } from "./WebsocketConnectMap";

export class WebsocketService extends AbstractSocketService {
    protected declare _service: WebSocketServer;

    private _connections: WebsocketConnectMap;

    private onError?: (remote: ISocketAddress | null, error: Error) => void;
    private clientIdGenerator?: (remote: ISocketAddress, req: IncomingMessage) => string;

    public constructor(
        register: IWSServerRegister,
        unregister: IWSServerUnregister,
        address?: ISocketAddress,
        option?: IWebsocketOption,
    ) {
        super(
            new WebSocketServer({
                ...option,
                host: address?.address,
                port: address?.port,
            }),
            "ws",
            address,
        );

        this.onError = option?.error;
        this.clientIdGenerator = option?.clientIdGenerator;

        this._connections = new WebsocketConnectMap(register, unregister, option?.error);

        this._service.on("connection", this.onconnection.bind(this));
        this._service.on("error", this.onerror.bind(this));
    }

    public override async close(callback?: (err?: Error) => void): Promise<void> {
        await this._connections.close();
        await super.close(callback);
    }

    /** @deprecated */
    public listen(_callback?: CallbackAction): void {
        throw ErrorHelper.getError(
            SERVICE_ERROR_CODES.INTERNAL_ERROR,
            `websocket-server[${this.id}] error - the instance is running on ${`[${this.host}]:${this.port}`} already.`,
            "websocket server will be automatically running when the instance is created, not needs to explicitly start it.",
        );
    }

    private onconnection(websocket: WebSocket, request: IncomingMessage): void {
        const id = (this.clientIdGenerator || guid)(
            {
                address: request.socket.remoteAddress || "",
                port: request.socket.remotePort || 0,
            },
            request,
        );

        this._connections.new(id, websocket, request);
    }

    private onerror(error: Error): void {
        void TIANYU.audit.error(
            this.app,
            `websocket-server[${this.id}] error - ${error.message}`,
            ErrorHelper.getError(
                SERVICE_ERROR_CODES.INTERNAL_ERROR,
                `websocket-server[${this.id}] error - ${error.message}`,
                error.stack,
            ),
        );
        this.onError?.(null, error);
    }
}

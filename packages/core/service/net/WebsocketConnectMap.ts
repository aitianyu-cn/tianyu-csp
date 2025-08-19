/** @format */

import { WebSocket } from "ws";
import { WebsocketConnection } from "./WebsocketConnection";
import { ISocketAddress, IWSServerRegister, IWSServerUnregister } from "#interface";
import { IncomingMessage } from "http";
import { ErrorHelper } from "#utils";
import { SERVICE_ERROR_CODES } from "#core/Constant";

export interface WebSocketConnect {
    connection: WebsocketConnection;
}

export class WebsocketConnectMap {
    private _map: Map<string, WebSocketConnect>;

    private register: IWSServerRegister;
    private unregister: IWSServerUnregister;
    private onError?: (remote: ISocketAddress, error: Error) => void;

    public constructor(
        register: IWSServerRegister,
        unregister: IWSServerUnregister,
        error?: (remote: ISocketAddress, error: Error) => void,
    ) {
        this._map = new Map<string, WebSocketConnect>();
        this.onError = error;
        this.register = register;
        this.unregister = unregister;
    }

    public new(id: string, conn: WebSocket, request: IncomingMessage): void {
        if (this._map.has(id)) {
            this.handleDuplicated(id, conn, request);
            return;
        }

        const connection = new WebsocketConnection(id, conn, request, this.stop.bind(this, id));
        this._map.set(id, { connection });
        this.register(id, connection);
    }

    public remove(id: string): void {
        const conn = this._map.get(id);
        if (conn) {
            conn.connection.close();
            this._map.delete(id);
            this.unregister(id);
        }
    }

    public get(id: string): WebsocketConnection | null {
        return this._map.get(id)?.connection ?? null;
    }

    public list(): string[] {
        const ids: string[] = [];
        for (const id of this._map.keys()) {
            ids.push(id);
        }
        return ids;
    }

    public async close(): Promise<void> {
        const olds = this._map;

        this._map = new Map<string, WebSocketConnect>();
        for (const conn of olds) {
            conn[1].connection.close();
            this.unregister(conn[0]);
        }
    }

    private handleDuplicated(id: string, conn: WebSocket, request: IncomingMessage): void {
        conn.send(
            ErrorHelper.getErrorString(
                SERVICE_ERROR_CODES.INTERNAL_ERROR,
                `websocket-connection creation failed. This might be an authorication issue or internal server problem, could not to create connection on duplicated link.`,
                "please ensure the connection link is not used.",
            ),
        );
        conn.close();
        this.onError?.(
            { address: request.socket.remoteAddress || "", port: request.socket.remotePort || 0 },
            new Error(`duplicated connection for same id: ${id}`),
        );
    }

    private stop(id: string): void {
        const conn = this._map.get(id);
        if (conn) {
            this._map.delete(id);
        }
    }
}

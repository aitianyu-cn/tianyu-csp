/** @format */

import {
    DefaultRequestItemsMap,
    DefaultRequestItemTargetType,
    IDispatcherConsumer,
    IDispatchHandler,
    INetworkService,
    IRequestHandler,
    PayloadData,
} from "#interface";

export class RequestHandler implements IRequestHandler, IDispatcherConsumer {
    private _dispatcher: IDispatchHandler;
    private _nameMap: DefaultRequestItemsMap;

    private _services: Map<string, INetworkService>;

    public constructor(dispatcher: IDispatchHandler, itemNameMap?: DefaultRequestItemsMap) {
        this._dispatcher = dispatcher;
        this._nameMap = itemNameMap || {};

        this._services = new Map<string, INetworkService>();

        this._dispatcher.bind(this);
    }

    public dispatch(payload: PayloadData): void {
        throw new Error("Method not implemented.");
    }

    public register(service: INetworkService): void {
        this._services.set(service.id, service);
    }

    public unregister(serviceId: string): void {
        this._services.delete(serviceId);
    }

    public getRequestItem(name: keyof DefaultRequestItemsMap, type: DefaultRequestItemTargetType): string {
        const item = this._nameMap[name] || "";
        if (typeof item === "string") {
            return item;
        }

        return item[type];
    }
}

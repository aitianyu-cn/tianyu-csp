/** @format */

import {
    DefaultRequestItemsMap,
    DefaultRequestItemTargetType,
    DISPATCH_HANDLER_MODULE_ID,
    NetworkServiceResponseData,
    REQUEST_HANDLER_MODULE_ID,
    RequestPayloadData,
    RequestRestData,
} from "#interface";

export class RequestHandler {
    private _nameMap: DefaultRequestItemsMap;

    public constructor(itemNameMap?: DefaultRequestItemsMap) {
        this._nameMap = itemNameMap || {};

        // create endpoints
        TIANYU.fwk.contributor.registerEndpoint("request-handler.dispatcher");
        TIANYU.fwk.contributor.registerEndpoint("request-handler.items-getter");

        // register execution modules for request handler
        TIANYU.fwk.contributor.exportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID, this._dispatch.bind(this));
        TIANYU.fwk.contributor.exportModule(
            "request-handler.items-getter",
            REQUEST_HANDLER_MODULE_ID,
            this._getRequestItem.bind(this),
        );
    }

    private _getRequestItem(payload: { name: keyof DefaultRequestItemsMap; type: DefaultRequestItemTargetType }): string {
        const item = this._nameMap[payload.name] || "";
        if (typeof item === "string") {
            return item;
        }

        return item[payload.type];
    }

    private _dispatch(data: { rest: RequestRestData; payload: RequestPayloadData }): Promise<NetworkServiceResponseData> {
        const dispatcher = TIANYU.fwk.contributor.findModule("dispatch-handler.network-dispatcher", DISPATCH_HANDLER_MODULE_ID);
        if (!dispatcher) {
            return Promise.reject(new Error());
        }

        return dispatcher({ ...data });
    }
}

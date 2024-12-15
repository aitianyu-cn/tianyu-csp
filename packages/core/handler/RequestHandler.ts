/** @format */

import { DEFAULT_REST_REQUEST_ITEM_MAP } from "#core/infra/Constant";
import {
    DefaultRequestItemsMap,
    DefaultRequestItemTargetType,
    DISPATCH_HANDLER_MODULE_ID,
    HTTP_STATUS_CODE,
    NetworkServiceResponseData,
    REQUEST_HANDLER_MODULE_ID,
    RequestPayloadData,
    RequestRestData,
} from "#interface";
import { ErrorHelper } from "#utils/ErrorHelper";
import { REST_REQUEST_ITEM_MAP } from "./RestHandlerConstant";

export class RequestHandler {
    public constructor() {
        // create endpoints
        TIANYU.fwk.contributor.registerEndpoint("request-handler.dispatcher");
        TIANYU.fwk.contributor.registerEndpoint("request-handler.items-getter");
    }

    public initialize(): void {
        // register execution modules for request handler
        TIANYU.fwk.contributor.exportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID, this._dispatch.bind(this));
        TIANYU.fwk.contributor.exportModule(
            "request-handler.items-getter",
            REQUEST_HANDLER_MODULE_ID,
            this._getRequestItem.bind(this),
        );
    }

    public destroy(): void {
        TIANYU.fwk.contributor.unexportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
        TIANYU.fwk.contributor.unexportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);
    }

    private _getRequestItem(payload: { name: keyof DefaultRequestItemsMap; type: DefaultRequestItemTargetType }): string {
        const c_item = REST_REQUEST_ITEM_MAP[payload.name];
        const d_item = DEFAULT_REST_REQUEST_ITEM_MAP[payload.name];

        const item = c_item || /* istanbul ignore next */ d_item || /* istanbul ignore next */ "";
        if (typeof item === "string") {
            return item;
        }

        return item[payload.type];
    }

    private _dispatch(data: { rest: RequestRestData; payload: RequestPayloadData }): Promise<NetworkServiceResponseData> {
        const dispatcher = TIANYU.fwk.contributor.findModule("dispatch-handler.network-dispatcher", DISPATCH_HANDLER_MODULE_ID);
        if (!dispatcher) {
            return Promise.reject(
                ErrorHelper.getError(
                    HTTP_STATUS_CODE.SERVICE_UNAVAILABLE.toString(),
                    "request could not be handled",
                    "network dispatcher is not inited or not exist.",
                ),
            );
        }

        return dispatcher({ ...data });
    }
}

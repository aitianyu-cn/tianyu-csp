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
    ICSPContributorFactorProtocolMap,
} from "#interface";
import { ErrorHelper } from "#utils";
import { IContributor } from "@aitianyu.cn/tianyu-app-fwk";
import { REST_REQUEST_ITEM_MAP } from "./RestHandlerConstant";

/**
 * Tianyu CSP Http Request handler
 *
 * to dispatch network requests to dispatch handler
 */
export class RequestHandler {
    private _contributor?: IContributor<ICSPContributorFactorProtocolMap>;

    /**
     * Create a request handler instance
     *
     * @param contributor app framework contributor for registering some external apis
     */
    public constructor(contributor?: IContributor<ICSPContributorFactorProtocolMap>) {
        this._contributor = contributor;

        // create endpoints
        this._contributor?.registerEndpoint("request-handler.dispatcher");
        this._contributor?.registerEndpoint("request-handler.items-getter");
    }

    /** To initialize the request handler */
    public initialize(): void {
        // register execution modules for request handler
        this._contributor?.exportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID, this._dispatch.bind(this));
        this._contributor?.exportModule(
            "request-handler.items-getter",
            REQUEST_HANDLER_MODULE_ID,
            this._getRequestItem.bind(this),
        );
    }

    /** To destroy current request handler */
    public destroy(): void {
        this._contributor?.unexportModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
        this._contributor?.unexportModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);
    }

    /**
     * To get a request item key name
     *
     * @param payload request item search payload
     * @returns return a string of key name, empty string will be returned if item is not found
     */
    private _getRequestItem(payload: { name: keyof DefaultRequestItemsMap; type: DefaultRequestItemTargetType }): string {
        const c_item = REST_REQUEST_ITEM_MAP[payload.name];
        const d_item = DEFAULT_REST_REQUEST_ITEM_MAP[payload.name];

        const item = c_item || /* istanbul ignore next */ d_item || /* istanbul ignore next */ "";
        if (typeof item === "string") {
            return item;
        }

        return item[payload.type];
    }

    /**
     * To dispatch a http request into dispatch handler to execution
     *
     * @param data request payload data
     * @returns return a network response data
     */
    private _dispatch(data: { rest: RequestRestData; payload: RequestPayloadData }): Promise<NetworkServiceResponseData> {
        const dispatcher = this._contributor?.findModule("dispatch-handler.network-dispatcher", DISPATCH_HANDLER_MODULE_ID);
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

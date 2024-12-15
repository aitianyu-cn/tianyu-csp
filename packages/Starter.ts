/** @format */

import { loadInfra } from "#core/InfraLoader";
import { DispatchHandlerOption, HttpServiceOption } from "#interface";
import { CallbackAction } from "@aitianyu.cn/types";
import { DispatchHandler, HttpService, RequestHandler } from "./core";

export function start(option?: HttpServiceOption & DispatchHandlerOption): CallbackAction {
    loadInfra();

    const dispatcher = new DispatchHandler(option);
    dispatcher.initialize();
    const requestHandler = new RequestHandler();
    requestHandler.initialize();

    const http1 = new HttpService(option);
    return () => {
        http1.listen();
    };
}

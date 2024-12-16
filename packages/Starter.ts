/** @format */

import { loadInfra } from "#core/InfraLoader";
import { DispatchHandlerOption, HttpServiceOption } from "#interface";
import { CallbackAction } from "@aitianyu.cn/types";
import { DispatchHandler, HttpService, RequestHandler } from "./core";

export interface IStarterApp {
    (): void;

    http1(): void;
}

export interface IStarterAppOption {
    handler?: DispatchHandlerOption;
    http1?: HttpServiceOption;
}

export function start(option?: IStarterAppOption): IStarterApp {
    loadInfra();

    const dispatcher = new DispatchHandler(option?.handler);
    dispatcher.initialize();
    const requestHandler = new RequestHandler();
    requestHandler.initialize();

    const http1 = new HttpService(option?.http1);

    let _http1_started = false;

    const startHttp1 = () => {
        if (!_http1_started) {
            _http1_started = true;
            http1.listen();
        }
    };

    const app = (() => {
        startHttp1();
    }) as IStarterApp;
    app.http1 = startHttp1;

    return app;
}

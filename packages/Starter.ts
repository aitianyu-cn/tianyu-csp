/** @format */

import { createContributor, loadInfra } from "#core/InfraLoader";
import { DispatchHandlerOption, HttpServiceOption } from "#interface";
import { DispatchHandler, HttpService, RequestHandler } from "./core";

export interface IStarterApp {
    (): void;

    http1(): void;
    close(): void;
}

export interface IStarterAppOption {
    handler?: DispatchHandlerOption;
    http1?: HttpServiceOption;
}

export function start(option?: IStarterAppOption): IStarterApp {
    loadInfra();

    const contributor = createContributor();

    const dispatcher = new DispatchHandler(option?.handler, contributor);
    dispatcher.initialize();
    const requestHandler = new RequestHandler(contributor);
    requestHandler.initialize();

    const http1 = new HttpService(option?.http1, contributor);

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
    app.close = () => {
        http1.close();
    };

    return app;
}

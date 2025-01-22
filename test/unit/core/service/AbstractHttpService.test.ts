/** @format */

import { SERVICE_HOST, SERVICE_PORT } from "test/content/HttpConstant";
import {
    AbstractHttpService,
    IHttpServerAction,
    IHttpServerLifecycle,
    IHttpServerListener,
} from "#core/service/AbstractHttpService";
import { HttpProtocal, HttpServiceOption } from "#interface";

interface ITestEvent {
    test: string;
}

class TestService extends AbstractHttpService<HttpServiceOption, ITestEvent> {
    protected createServerInstance(
        opt?: HttpServiceOption | undefined,
    ): IHttpServerListener & IHttpServerLifecycle & IHttpServerAction {
        const server: IHttpServerListener & IHttpServerLifecycle & IHttpServerAction = {
            listen: (
                port?: number,
                hostname?: string,
                backlog?: number,
                listeningListener?: () => void,
            ): IHttpServerListener & IHttpServerLifecycle & IHttpServerAction => {
                return server;
            },
            close: (callback?: (err?: Error) => void): IHttpServerListener & IHttpServerLifecycle & IHttpServerAction => {
                return server;
            },
            on: (
                event: "error",
                listener: (err: Error) => void,
            ): IHttpServerListener & IHttpServerLifecycle & IHttpServerAction => {
                return server;
            },
        };

        return server;
    }
    protected protocol: HttpProtocal = "http";
}

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.service.AbstractHttpService", () => {
    let SERVICE: TestService;

    beforeEach(() => {
        SERVICE = new TestService({ host: SERVICE_HOST, port: SERVICE_PORT });

        expect(Object.keys(SERVICE["_eventMap"]).length).toEqual(0);
    });

    it("watch & unwatch", () => {
        SERVICE.watch("test", "w", () => undefined);

        expect(SERVICE["_eventMap"]["test"]).toBeDefined();
        expect(SERVICE["_eventMap"].test?.watches["w"]).toBeDefined();

        SERVICE.unwatch("test", "w");

        expect(SERVICE["_eventMap"]["test"]).toBeDefined();
        expect(SERVICE["_eventMap"].test?.watches["w"]).toBeUndefined();
    });

    it("emit", () => {
        const spyFunc = jest.fn();

        SERVICE.watch("test", "w", spyFunc);
        expect(SERVICE["_eventMap"]["test"]).toBeDefined();
        expect(SERVICE["_eventMap"].test?.watches["w"]).toBeDefined();

        SERVICE.emit("test", "test-emit");

        expect(spyFunc).toHaveBeenCalledWith("test-emit");
    });
});

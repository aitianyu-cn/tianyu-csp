/** @format */

import { WebsocketService } from "#core/service/net/WebsocketService";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.service.net.WebsocketService", () => {
    const FN_REGISTER = jest.fn();
    const FN_UNREGISTER = jest.fn();
    const FN_ERROR = jest.fn();

    let SERVICE: WebsocketService;

    beforeEach(() => {
        SERVICE = new WebsocketService(FN_REGISTER, FN_UNREGISTER, undefined, { error: FN_ERROR, noServer: true });
    });

    afterEach(async () => {
        await SERVICE.close();
    });

    it("listen", () => {
        expect(() => {
            SERVICE.listen();
        }).toThrow();
    });

    it("onconnection", () => {
        SERVICE["onconnection"](
            { on: jest.fn(), close: jest.fn() } as any,
            {
                socket: {
                    remoteAddress: "",
                    remotePort: 0,
                },
            } as any,
        );

        expect(FN_REGISTER).toHaveBeenCalled();
    });

    it("onerror", () => {
        const AUDIT_SPY = jest.spyOn(TIANYU.audit, "error");

        SERVICE["onerror"](new Error());

        expect(AUDIT_SPY).toHaveBeenCalled();
        expect(FN_ERROR).toHaveBeenCalled();
    });
});

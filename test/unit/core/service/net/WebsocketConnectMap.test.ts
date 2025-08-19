/** @format */

import { WebsocketConnectMap } from "#core/service/net/WebsocketConnectMap";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.service.net.WebsocketConnectMap", () => {
    const FN_REGISTER = jest.fn();
    const FN_UNREGISTER = jest.fn();
    const FN_ERROR = jest.fn();

    let ConnMap: WebsocketConnectMap;

    beforeEach(() => {
        ConnMap = new WebsocketConnectMap(FN_REGISTER, FN_UNREGISTER, FN_ERROR);
    });

    describe("new", () => {
        it("add success", () => {
            ConnMap.new("123", { on: jest.fn() } as any, {} as any);

            expect(FN_REGISTER).toHaveBeenCalled();
            expect(FN_ERROR).not.toHaveBeenCalled();
        });

        it("add duplicated", () => {
            const dupIns = { on: jest.fn(), send: jest.fn(), close: jest.fn() };
            ConnMap.new("123", { on: jest.fn() } as any, {} as any);
            ConnMap.new(
                "123",
                dupIns as any,
                {
                    socket: {
                        remoteAddress: "",
                        remotePort: 0,
                    },
                } as any,
            );
            expect(FN_ERROR).toHaveBeenCalled();
            expect(dupIns.on).not.toHaveBeenCalled();
            expect(dupIns.close).toHaveBeenCalled();
            expect(dupIns.send).toHaveBeenCalled();
        });
    });

    it("remove & get & list", () => {
        let CLOSE: Function = () => undefined;
        const ins = {
            on: jest.fn().mockImplementation((event: string, cb: Function) => {
                if (event === "close") {
                    CLOSE = cb;
                }
            }),
            close: jest.fn(),
        };

        ConnMap.new("123", { on: jest.fn(), close: jest.fn() } as any, {} as any);
        ConnMap.new("345", ins as any, {} as any);

        expect(ConnMap.list().length).toEqual(2);
        expect(ConnMap.get("123")).toBeDefined();
        expect(ConnMap.get("345")).toBeDefined();
        expect(ConnMap.get("567")).toBeNull();

        ConnMap.remove("123");
        expect(ConnMap.list().length).toEqual(1);
        expect(ConnMap.get("345")).toBeDefined();
        expect(ConnMap.get("123")).toBeNull();

        CLOSE();
        expect(ConnMap.list().length).toEqual(0);
        expect(ConnMap.get("345")).toBeNull();
        expect(ConnMap.get("123")).toBeNull();
    });
});

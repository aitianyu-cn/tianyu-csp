/** @format */

import { WebsocketConnection } from "#core/service/net/WebsocketConnection";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.service.net.WebsocketConnection", () => {
    const FN_STOP = jest.fn();

    it("on", () => {
        const socket = { on: jest.fn(), close: jest.fn() };

        const connection = new WebsocketConnection("123", socket as any, {} as any, FN_STOP);

        expect(connection["onError"]).toBeUndefined();
        expect(connection["onReceive"]).toBeUndefined();
        expect(connection["onPing"]).toBeUndefined();

        expect(() => {
            connection
                .on("error", jest.fn())
                .on("message", jest.fn())
                .on("ping", jest.fn())
                .on("" as any, jest.fn());
        }).not.toThrow();

        expect(connection["onError"]).toBeDefined();
        expect(connection["onReceive"]).toBeDefined();
        expect(connection["onPing"]).toBeDefined();
    });

    describe("post", () => {
        it("success", async () => {
            const socket = {
                on: jest.fn(),
                close: jest.fn(),
                send: jest.fn().mockImplementation((_buffer: Buffer, callback: Function) => {
                    callback();
                }),
            };

            const connection = new WebsocketConnection("123", socket as any, {} as any, FN_STOP);

            await connection.post("");

            expect(socket.send).toHaveBeenCalled();
        });

        it("failed", (done) => {
            const socket = {
                on: jest.fn(),
                close: jest.fn(),
                send: jest.fn().mockImplementation((_buffer: Buffer, callback: Function) => {
                    callback(new Error());
                }),
            };

            const connection = new WebsocketConnection("123", socket as any, {} as any, FN_STOP);
            connection.on("error", jest.fn());

            connection.post("").then(
                () => done.fail(),
                () => {
                    expect(socket.send).toHaveBeenCalled();
                    done();
                },
            );
        });
    });

    describe("internal", () => {
        const socket = {
            on: (event: string, cb: Function) => {
                if (event === "message") {
                    oncb.message = cb;
                }
                if (event === "error") {
                    oncb.error = cb;
                }
                if (event === "ping") {
                    oncb.ping = cb;
                }
            },
            close: jest.fn(),
        };
        const FN_ERROR = jest.fn();
        const FN_MSG = jest.fn();
        const FN_PING = jest.fn();

        let oncb: any = {};
        let connection: WebsocketConnection;

        beforeEach(() => {
            oncb = {};
            connection = new WebsocketConnection("123", socket as any, {} as any, FN_STOP);

            expect(() => {
                connection
                    .on("error", FN_ERROR)
                    .on("message", FN_MSG)
                    .on("ping", FN_PING)
                    .on("" as any, jest.fn());
            }).not.toThrow();

            expect(connection["onError"]).toBeDefined();
            expect(connection["onReceive"]).toBeDefined();
            expect(connection["onPing"]).toBeDefined();
        });

        it("receive", () => {
            oncb.message({}, false);
            expect(FN_MSG).toHaveBeenCalled();
            expect(FN_PING).not.toHaveBeenCalled();
            expect(FN_ERROR).not.toHaveBeenCalled();
        });

        it("error", () => {
            oncb.error(new Error());
            expect(FN_MSG).not.toHaveBeenCalled();
            expect(FN_PING).not.toHaveBeenCalled();
            expect(FN_ERROR).toHaveBeenCalled();
        });

        it("receive", () => {
            oncb.ping({});
            expect(FN_MSG).not.toHaveBeenCalled();
            expect(FN_PING).toHaveBeenCalled();
            expect(FN_ERROR).not.toHaveBeenCalled();
        });
    });
});

/** @format */

import { WebsocketConnection } from "#core/service/net/WebsocketConnection";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.service.net.WebsocketConnection", () => {
    it("on", () => {
        const socket = { on: jest.fn(), close: jest.fn() };

        const connection = new WebsocketConnection("123", socket as any, {} as any);

        expect(connection["onError"]).toBeUndefined();
        expect(connection["onReceive"]).toBeUndefined();
        expect(connection["onPing"]).toBeUndefined();
        expect(connection["onClose"]).toBeUndefined();
        expect(connection["onPong"]).toBeUndefined();

        expect(() => {
            connection
                .on("error", jest.fn())
                .on("message", jest.fn())
                .on("ping", jest.fn())
                .on("pong", jest.fn())
                .on("close", jest.fn())
                .on("" as any, jest.fn());
        }).not.toThrow();

        expect(connection["onError"]).toBeDefined();
        expect(connection["onReceive"]).toBeDefined();
        expect(connection["onPing"]).toBeDefined();
        expect(connection["onClose"]).toBeDefined();
        expect(connection["onPong"]).toBeDefined();
    });

    it("status", () => {
        const socket = { on: jest.fn(), close: jest.fn(), readyState: 1 };

        const connection = new WebsocketConnection("123", socket as any, {} as any);

        expect(connection.status).toEqual(1);
    });

    describe("ping", () => {
        it("success", async () => {
            const socket = {
                on: jest.fn(),
                close: jest.fn(),
                ping: jest.fn().mockImplementation((_buffer: Buffer, _mask: boolean, callback: Function) => {
                    callback();
                }),
            };

            const connection = new WebsocketConnection("123", socket as any, {} as any);

            await connection.ping();

            expect(socket.ping).toHaveBeenCalled();
        });

        it("failed", (done) => {
            const socket = {
                on: jest.fn(),
                close: jest.fn(),
                ping: jest.fn().mockImplementation((_buffer: Buffer, _mask: boolean, callback: Function) => {
                    callback(new Error());
                }),
            };

            const connection = new WebsocketConnection("123", socket as any, {} as any);
            connection.on("error", jest.fn());

            connection.ping().then(
                () => done.fail(),
                () => {
                    expect(socket.ping).toHaveBeenCalled();
                    done();
                },
            );
        });
    });

    describe("pong", () => {
        it("success", async () => {
            const socket = {
                on: jest.fn(),
                close: jest.fn(),
                pong: jest.fn().mockImplementation((_buffer: Buffer, _mask: boolean, callback: Function) => {
                    callback();
                }),
            };

            const connection = new WebsocketConnection("123", socket as any, {} as any);

            await connection.pong();

            expect(socket.pong).toHaveBeenCalled();
        });

        it("failed", (done) => {
            const socket = {
                on: jest.fn(),
                close: jest.fn(),
                pong: jest.fn().mockImplementation((_buffer: Buffer, _mask: boolean, callback: Function) => {
                    callback(new Error());
                }),
            };

            const connection = new WebsocketConnection("123", socket as any, {} as any);
            connection.on("error", jest.fn());

            connection.pong().then(
                () => done.fail(),
                () => {
                    expect(socket.pong).toHaveBeenCalled();
                    done();
                },
            );
        });
    });

    describe("post", () => {
        it("success", async () => {
            const socket = {
                on: jest.fn(),
                close: jest.fn(),
                send: jest.fn().mockImplementation((_buffer: Buffer, _option: any, callback: Function) => {
                    callback();
                }),
            };

            const connection = new WebsocketConnection("123", socket as any, {} as any);

            await connection.post("");

            expect(socket.send).toHaveBeenCalled();
        });

        it("failed", (done) => {
            const socket = {
                on: jest.fn(),
                close: jest.fn(),
                send: jest.fn().mockImplementation((_buffer: Buffer, _option: any, callback: Function) => {
                    callback(new Error());
                }),
            };

            const connection = new WebsocketConnection("123", socket as any, {} as any);
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
                if (event === "pong") {
                    oncb.pong = cb;
                }
                if (event === "close") {
                    oncb.close = cb;
                }
            },
            close: jest.fn(),
        };
        const FN_ERROR = jest.fn();
        const FN_MSG = jest.fn();
        const FN_PING = jest.fn();
        const FN_PONG = jest.fn();
        const FN_CLOSE = jest.fn();

        let oncb: any = {};
        let connection: WebsocketConnection;

        beforeEach(() => {
            oncb = {};
            connection = new WebsocketConnection("123", socket as any, {} as any);

            expect(() => {
                connection
                    .on("error", FN_ERROR)
                    .on("message", FN_MSG)
                    .on("ping", FN_PING)
                    .on("pong", FN_PONG)
                    .on("close", FN_CLOSE)
                    .on("" as any, jest.fn());
            }).not.toThrow();

            expect(connection["onError"]).toBeDefined();
            expect(connection["onReceive"]).toBeDefined();
            expect(connection["onPing"]).toBeDefined();
            expect(connection["onClose"]).toBeDefined();
            expect(connection["onPong"]).toBeDefined();
        });

        it("receive", () => {
            oncb.message({}, false);
            expect(FN_MSG).toHaveBeenCalled();
            expect(FN_PING).not.toHaveBeenCalled();
            expect(FN_ERROR).not.toHaveBeenCalled();
            expect(FN_PONG).not.toHaveBeenCalled();
            expect(FN_CLOSE).not.toHaveBeenCalled();
        });

        it("error", () => {
            oncb.error(new Error());
            expect(FN_MSG).not.toHaveBeenCalled();
            expect(FN_PING).not.toHaveBeenCalled();
            expect(FN_ERROR).toHaveBeenCalled();
            expect(FN_PONG).not.toHaveBeenCalled();
            expect(FN_CLOSE).not.toHaveBeenCalled();
        });

        it("ping", () => {
            oncb.ping({});
            expect(FN_MSG).not.toHaveBeenCalled();
            expect(FN_PING).toHaveBeenCalled();
            expect(FN_ERROR).not.toHaveBeenCalled();
            expect(FN_PONG).not.toHaveBeenCalled();
            expect(FN_CLOSE).not.toHaveBeenCalled();
        });

        it("pong", () => {
            oncb.pong({});
            expect(FN_MSG).not.toHaveBeenCalled();
            expect(FN_PING).not.toHaveBeenCalled();
            expect(FN_ERROR).not.toHaveBeenCalled();
            expect(FN_PONG).toHaveBeenCalled();
            expect(FN_CLOSE).not.toHaveBeenCalled();
        });

        it("close", () => {
            oncb.close({});
            expect(FN_MSG).not.toHaveBeenCalled();
            expect(FN_PING).not.toHaveBeenCalled();
            expect(FN_ERROR).not.toHaveBeenCalled();
            expect(FN_PONG).not.toHaveBeenCalled();
            expect(FN_CLOSE).toHaveBeenCalled();
        });
    });
});

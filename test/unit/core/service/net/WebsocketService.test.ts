/** @format */

import { WebsocketService } from "#core/service/net/WebsocketService";
import { TimerTools } from "test/tools/TimerTools";
import { WebSocket } from "ws";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.service.net.WebsocketService", () => {
    const FN_ERROR = jest.fn();

    let SERVICE: WebsocketService;

    beforeEach(() => {
        SERVICE = new WebsocketService(undefined, {
            error: FN_ERROR,
            noServer: true,
        });
    });

    afterEach(async () => {
        await SERVICE.close();
    });

    it("listen", () => {
        expect(() => {
            SERVICE.listen();
        }).toThrow();
    });

    it("on", () => {
        expect(() => {
            SERVICE.on("close", jest.fn())
                .on("connect", jest.fn())
                .on("error", jest.fn())
                .on("message", jest.fn())
                .on("ping", jest.fn())
                .on("pong", jest.fn())
                .on("" as any, jest.fn());
        }).not.toThrow();

        expect(SERVICE["_listeners"].close?.on.length).toEqual(1);
        expect(SERVICE["_listeners"].connect?.on.length).toEqual(1);
        expect(SERVICE["_listeners"].message?.on.length).toEqual(1);
        expect(SERVICE["_listeners"].error?.on.length).toEqual(1);
        expect(SERVICE["_listeners"].ping?.on.length).toEqual(1);
        expect(SERVICE["_listeners"].pong?.on.length).toEqual(1);
    });

    it("once", () => {
        expect(() => {
            SERVICE.once("close", jest.fn())
                .once("connect", jest.fn())
                .once("error", jest.fn())
                .once("message", jest.fn())
                .once("ping", jest.fn())
                .once("pong", jest.fn())
                .once("" as any, jest.fn());
        }).not.toThrow();

        expect(SERVICE["_listeners"].close?.once.length).toEqual(1);
        expect(SERVICE["_listeners"].connect?.once.length).toEqual(1);
        expect(SERVICE["_listeners"].message?.once.length).toEqual(1);
        expect(SERVICE["_listeners"].error?.once.length).toEqual(1);
        expect(SERVICE["_listeners"].ping?.once.length).toEqual(1);
        expect(SERVICE["_listeners"].pong?.once.length).toEqual(1);
    });

    describe("internal", () => {
        const ID = "123";
        beforeEach(async () => {
            const SPY = jest.fn();
            SERVICE.on("connect", SPY);
            SERVICE["clientIdGenerator"] = () => ID;

            const socket = {
                close: () => undefined,
                on: () => socket,
            };
            await SERVICE["onconnection"](
                socket as any,
                {
                    socket: {
                        remoteAddress: "",
                        remotePort: 0,
                    },
                } as any,
            );

            const conn = SERVICE["_connections"].get(ID);
            if (conn) {
                conn.flag = "free";
            }

            expect(SPY).toHaveBeenCalled();
            expect(SERVICE.clients.length).toEqual(1);
        });

        it("onclose", () => {
            const SPY = jest.fn();
            SERVICE.on("close", SPY);
            SERVICE["onclose"](ID, 0, Buffer.from(""));
            expect(SERVICE.clients.length).toEqual(0);
            expect(SPY).toHaveBeenCalled();
        });

        it("onreceive", () => {
            const SPY = jest.fn();
            SERVICE.on("message", SPY);
            SERVICE["onreceive"](ID, Buffer.from(""), false);
            expect(SERVICE["_connections"].get(ID)?.flag).toEqual("active");
            expect(SPY).toHaveBeenCalled();
        });

        it("onping", () => {
            const SPY = jest.fn();
            SERVICE.on("ping", SPY);
            SERVICE["onping"](ID);
            expect(SERVICE["_connections"].get(ID)?.flag).toEqual("active");
            expect(SPY).toHaveBeenCalled();
        });

        it("onpong", () => {
            const SPY = jest.fn();
            SERVICE.on("pong", SPY);
            SERVICE["onpong"](ID);
            expect(SERVICE["_connections"].get(ID)?.flag).toEqual("active");
            expect(SPY).toHaveBeenCalled();
        });

        it("onerror", () => {
            const SPY = jest.fn();
            SERVICE.on("error", SPY);
            SERVICE["onerror"](ID, new Error());
            expect(SERVICE.clients.length).toEqual(1);
            expect(SPY).toHaveBeenCalled();
        });
    });

    it("service error", () => {
        const SPY = jest.spyOn(TIANYU.audit, "error").mockReturnValue(Promise.resolve());
        SERVICE["onError"] = jest.fn();

        SERVICE["onservererror"](new Error());

        expect(SPY).toHaveBeenCalled();
        expect(SERVICE["onError"]).toHaveBeenCalled();
    });

    describe("processConnection", () => {
        it("invalid connection", async () => {
            SERVICE["clientIdGenerator"] = () => "";
            SERVICE["onError"] = jest.fn();

            const socket = {
                close: jest.fn(),
                send: jest.fn().mockImplementation((_, cb) => {
                    cb();
                }),
            };
            await SERVICE["onconnection"](
                socket as any,
                {
                    socket: {
                        remoteAddress: "",
                        remotePort: 0,
                    },
                } as any,
            );
            expect(socket.send).toHaveBeenCalled();
            expect(socket.close).toHaveBeenCalled();
            expect(SERVICE["onError"]).toHaveBeenCalled();
        });

        it("duplicated connection", async () => {
            SERVICE["onError"] = jest.fn();
            SERVICE["clientIdGenerator"] = () => "123";
            SERVICE["_connections"].set("123", {
                connection: { close: () => undefined } as any,
                last: 0,
                flag: "active",
                remote: { address: "", port: 0 },
            });

            const socket = {
                close: jest.fn(),
                send: jest.fn().mockImplementation((_, cb) => {
                    cb();
                }),
            };
            await SERVICE["onconnection"](
                socket as any,
                {
                    socket: {
                        remoteAddress: "",
                        remotePort: 0,
                    },
                } as any,
            );
            expect(socket.send).toHaveBeenCalled();
            expect(socket.close).toHaveBeenCalled();
            expect(SERVICE["onError"]).toHaveBeenCalled();
        });
    });

    describe("watch dog", () => {
        it("timeout", async () => {
            SERVICE["_autoPing"] = true;
            SERVICE["onError"] = jest.fn();
            SERVICE["_connections"].set("123", {
                connection: {
                    close: () => {
                        SERVICE["onclose"]("123", 0, Buffer.from(""));
                    },
                    status: WebSocket.CLOSED,
                } as any,
                last: 0,
                flag: "active",
                remote: { address: "", port: 0 },
            });
            SERVICE["_connections"].set("456", {
                connection: {
                    close: () => {
                        SERVICE["onclose"]("456", 0, Buffer.from(""));
                    },
                    status: WebSocket.CLOSING,
                } as any,
                last: 0,
                flag: "active",
                remote: { address: "", port: 0 },
            });
            SERVICE["_connections"].set("789", {
                connection: {
                    close: () => {
                        SERVICE["onclose"]("789", 0, Buffer.from(""));
                    },
                    status: WebSocket.OPEN,
                } as any,
                last: 0,
                flag: "free",
                remote: { address: "", port: 0 },
            });
            SERVICE["_connections"].set("147", {
                connection: {
                    close: () => {
                        SERVICE["onclose"]("147", 0, Buffer.from(""));
                    },
                    status: WebSocket.OPEN,
                    ping: async () => Promise.reject(""),
                } as any,
                last: 0,
                flag: "active",
                remote: { address: "", port: 0 },
            });
            SERVICE["_connections"].set("258", {
                connection: {
                    close: () => {
                        SERVICE["onclose"]("258", 0, Buffer.from(""));
                    },
                    status: WebSocket.OPEN,
                    ping: async () => Promise.reject(new Error()),
                } as any,
                last: 0,
                flag: "active",
                remote: { address: "", port: 0 },
            });
            await SERVICE["onconnection"](
                {
                    close: () => undefined,
                    on: () => undefined,
                    status: WebSocket.OPEN,
                    ping: async () => Promise.reject(new Error()),
                } as any,
                {
                    socket: {
                        remoteAddress: "",
                        remotePort: 0,
                    },
                } as any,
            );

            if (SERVICE["_watcher"]) {
                clearTimeout(SERVICE["_watcher"]);
            }
            await SERVICE["onwatch"]();
            await TimerTools.sleep(2000);

            expect(SERVICE.clients.length).toEqual(3);
        }, 100000);
    });
});

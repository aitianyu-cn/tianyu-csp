/** @format */

import { Json } from "#base/index";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { TcpService } from "#core/service/net/TcpService";
import { Net } from "#module";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.service.net.TcpService", () => {
    const dataHanler = async (id: string, data: Buffer, _isBinary: boolean) => {
        const src = data.toString("utf-8");
        if (src === "Hello") {
            void SERVICE.post(id, Buffer.from("Hello World!"));
        }
    };

    const connectionHandler = {
        end: () => undefined,
        start: () => undefined,
    };

    let SERVICE: TcpService;

    beforeEach((done) => {
        SERVICE = new TcpService(
            {
                address: "0.0.0.0",
                port: 60001,
            },
            {
                autoPing: true,
                autoPong: true,
            },
        );

        SERVICE.on("connect", connectionHandler.start);
        SERVICE.on("close", connectionHandler.end);
        SERVICE.on("message", dataHanler);

        SERVICE.listen(() => {
            expect(SERVICE.listening).toBeTruthy();
            done();
        });
    });

    afterEach((done) => {
        void SERVICE.close(done);
    });

    describe("test case 1", () => {
        it("has response message", async () => {
            let dataStr = "";

            const client = new Net.TcpClient({ log: true });
            const receivePromise = new Promise<void>((resolve) => {
                const onData = (data: Buffer) => {
                    dataStr = data.toString("utf-8");
                    resolve();
                };
                client.onData = onData;
            });
            await client.connect({
                host: "127.0.0.1",
                port: 60001,
            });
            await client.send(Buffer.from("Hello"));
            await receivePromise;

            client.close();

            expect(dataStr).toEqual("Hello World!");
        });

        it("service error", async () => {
            const ERROR_SPY = jest.spyOn(TIANYU.logger, "error");
            SERVICE["_service"].emit("error", new Error());
            expect(ERROR_SPY).toHaveBeenCalled();
        });

        it("duplicate closing not cause error", async () => {
            await new Promise<void>((resolve) => {
                void SERVICE.close(() => {
                    resolve();
                });
            });

            expect(SERVICE.listening).toBeFalsy();

            expect(() => {
                void SERVICE.close();
            }).not.toThrow();
        });
    });

    describe("test case 2", () => {
        beforeEach(() => {
            SERVICE["clientIdGenerator"] = () => "123";
        });

        afterEach(() => {
            SERVICE["clientIdGenerator"] = undefined;
        });

        it("ping", async () => {
            let dataStr = "";

            const client = new Net.TcpClient({ log: true });
            const receivePromise = new Promise<void>((resolve) => {
                const onData = (data: Buffer) => {
                    dataStr = data.toString("utf-8");
                    resolve();
                };
                client.onData = onData;
            });
            await client.connect({
                host: "127.0.0.1",
                port: 60001,
            });
            await SERVICE.ping("123");
            await receivePromise;

            client.close();

            expect(dataStr).toEqual(TcpService.DEFAULT_PING);
        });

        it("pong", async () => {
            let dataStr = "";

            const client = new Net.TcpClient({ log: true });
            const receivePromise = new Promise<void>((resolve) => {
                const onData = (data: Buffer) => {
                    dataStr = data.toString("utf-8");
                    resolve();
                };
                client.onData = onData;
            });
            await client.connect({
                host: "127.0.0.1",
                port: 60001,
            });
            await SERVICE.pong("123");
            await receivePromise;

            client.close();

            expect(dataStr).toEqual(TcpService.DEFAULT_PONG);
        });

        it("duplicate connection", async () => {
            const first = new Net.TcpClient({ log: true });
            await first.connect({
                host: "127.0.0.1",
                port: 60001,
            });

            let dataStr = "";

            const client = new Net.TcpClient({ log: true });
            const receivePromise = new Promise<void>((resolve) => {
                const onData = (data: Buffer) => {
                    dataStr = data.toString("utf-8");
                    resolve();
                };
                client.onData = onData;
            });
            await client.connect({
                host: "127.0.0.1",
                port: 60001,
            });
            await receivePromise;

            client.close();

            expect(Json.parseSafe(dataStr)?.code).toEqual(SERVICE_ERROR_CODES.INTERNAL_ERROR);
        });

        it("handle ping", async () => {
            let dataStr = "";

            const client = new Net.TcpClient({ log: true });
            const receivePromise = new Promise<void>((resolve) => {
                const onData = (data: Buffer) => {
                    dataStr = data.toString("utf-8");
                    resolve();
                };
                client.onData = onData;
            });
            await client.connect({
                host: "127.0.0.1",
                port: 60001,
            });
            await client.send(Buffer.from(TcpService.DEFAULT_PING));
            await receivePromise;

            client.close();

            expect(dataStr).toEqual(TcpService.DEFAULT_PONG);
        });

        it("ping failed", async () => {
            const errorPro = new Promise<void>((resolve) => {
                SERVICE["onError"] = () => resolve();
            });
            jest.spyOn(SERVICE as any, "sendPong").mockImplementation(async () => {
                return Promise.reject();
            });
            const client = new Net.TcpClient({ log: true });
            client.onData = jest.fn();
            await client.connect({
                host: "127.0.0.1",
                port: 60001,
            });
            await client.send(Buffer.from(TcpService.DEFAULT_PING));

            client.close();

            await errorPro;
        });

        it("handle pong", async () => {
            const client = new Net.TcpClient({ log: true });
            const receivePromise = new Promise<void>((resolve) => {
                const onData = () => {
                    resolve();
                };
                SERVICE.once("pong", onData);
            });
            await client.connect({
                host: "127.0.0.1",
                port: 60001,
            });
            await client.send(Buffer.from(TcpService.DEFAULT_PONG));
            await receivePromise;

            client.close();
        });
    });

    describe("test case 3", () => {
        it("send failed", (done) => {
            const socket: any = {
                write: jest.fn().mockImplementation((_data, cb) => {
                    cb(new Error());
                }),
            };

            SERVICE["sendData"](socket, Buffer.from("")).then(
                () => done.fail(),
                () => {
                    expect(socket.write).toHaveBeenCalled();
                    done();
                },
            );
        });

        it("ping failed", (done) => {
            const socket: any = {
                write: jest.fn().mockImplementation((_data, cb) => {
                    cb(new Error());
                }),
            };

            SERVICE["sendPing"]({ connection: socket } as any).then(
                () => done.fail(),
                () => {
                    expect(socket.write).toHaveBeenCalled();
                    done();
                },
            );
        });

        it("pong failed", (done) => {
            const socket: any = {
                write: jest.fn().mockImplementation((_data, cb) => {
                    cb(new Error());
                }),
            };

            SERVICE["sendPong"]({ connection: socket } as any).then(
                () => done.fail(),
                () => {
                    expect(socket.write).toHaveBeenCalled();
                    done();
                },
            );
        });
    });

    it("check close", () => {
        expect(SERVICE["checkClosed"](1)).toBeTruthy();
        expect(SERVICE["checkClosed"](0)).toBeFalsy();
    });
});

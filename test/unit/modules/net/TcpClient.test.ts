/** @format */

import { Net } from "#module";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.net.TcpClient", () => {
    describe("failed case", () => {
        it("connect with error", (done) => {
            const ERR_SPY = jest.spyOn(TIANYU.logger, "error");
            const client = new Net.TcpClient({ log: true });
            client
                .connect({
                    host: "255.255.255.255",
                    port: 60004,
                })
                .then(
                    () => {
                        done.fail();
                    },
                    () => {
                        expect(ERR_SPY).toHaveBeenCalled();
                        done();
                    },
                );
        });

        it("send with error", (done) => {
            const ERR_SPY = jest.spyOn(TIANYU.logger, "error");
            const client = new Net.TcpClient({ log: true });
            client.send(Buffer.from("test")).then(
                () => {
                    done.fail();
                },
                () => {
                    expect(ERR_SPY).toHaveBeenCalled();
                    done();
                },
            );
        });

        it("client error", () => {
            const fnErrorHandler = jest.fn();
            const client = new Net.TcpClient({ log: true });
            client.onError = fnErrorHandler;
            client["_client"].emit("error", true);
            expect(fnErrorHandler).toHaveBeenCalled();
        });

        it("auto pong failed", async () => {
            const client = new Net.TcpClient({ log: true, autoPong: true });
            jest.spyOn(client, "pong").mockImplementation(async () => Promise.reject());
            const promise1 = new Promise<void>((resolve) => {
                jest.spyOn(TIANYU.audit, "error").mockImplementation(async () => {
                    resolve();
                    return Promise.resolve();
                });
            });
            const promise2 = new Promise<void>((resolve) => {
                client.onPing = resolve;
            });

            client["onping"]();

            await promise2;
            await promise1;
        });
    });

    it("resetWatcher", () => {
        const client = new Net.TcpClient({ log: true });
        client["_watcher"] = setTimeout(() => undefined, 10000);

        client["resetWatcher"]();

        expect(client["_watcher"]).toBeNull();
    });

    it("setWatcher", () => {
        const client = new Net.TcpClient({ log: true, autoPing: true });

        client["setWatcher"]();

        expect(client["_watcher"]).not.toBeNull();

        client["resetWatcher"]();
    });

    describe("watcherHandler", () => {
        it("died", async () => {
            const client = new Net.TcpClient({ log: true });
            const SPY = jest.spyOn(client, "close").mockImplementation(() => undefined);
            client["_healthy"] = "died";

            await client["watcherHandler"]();

            expect(SPY).toHaveBeenCalled();
        });

        it("health", async () => {
            const client = new Net.TcpClient({ log: true });
            const SPY_CLOSE = jest.spyOn(client, "close").mockImplementation(() => undefined);
            jest.spyOn(client, "ping").mockImplementation(async () => Promise.resolve());
            const promise = new Promise<void>((resolve) => {
                jest.spyOn(client as any, "setWatcher").mockImplementation(() => {
                    resolve();
                });
            });
            client["_healthy"] = "health";

            await client["watcherHandler"]();
            await promise;

            expect(client["_healthy"]).toEqual("unhealth");
            expect(SPY_CLOSE).not.toHaveBeenCalled();
        });

        it("unhealth", async () => {
            const client = new Net.TcpClient({ log: true });
            const SPY_CLOSE = jest.spyOn(client, "close").mockImplementation(() => undefined);
            jest.spyOn(client, "ping").mockImplementation(async () => Promise.resolve());
            const promise = new Promise<void>((resolve) => {
                jest.spyOn(client as any, "setWatcher").mockImplementation(() => {
                    resolve();
                });
            });
            client["_healthy"] = "unhealth";

            await client["watcherHandler"]();
            await promise;

            expect(client["_healthy"]).toEqual("died");
            expect(SPY_CLOSE).not.toHaveBeenCalled();
        });

        it("ping failed", async () => {
            const client = new Net.TcpClient({ log: true });
            const SPY_CLOSE = jest.spyOn(client, "close").mockImplementation(() => undefined);
            jest.spyOn(client, "ping").mockImplementation(async () => Promise.reject());
            const promise = new Promise<void>((resolve) => {
                jest.spyOn(TIANYU.audit, "error").mockImplementation(async () => {
                    resolve();
                });
            });
            client["_healthy"] = "unhealth";

            await client["watcherHandler"]();
            await promise;

            expect(client["_healthy"]).toEqual("died");
            expect(SPY_CLOSE).not.toHaveBeenCalled();
        });
    });
});

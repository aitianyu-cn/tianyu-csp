/** @format */

import { Integer } from "#base/index";
import { WebsocketService } from "#core/service/net/WebsocketService";
import { TimerTools } from "test/tools/TimerTools";
import { RawData } from "ws";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.net.WebsocketClient", () => {
    const SERVICE = new WebsocketService(
        { address: "0.0.0.0", port: 60005 },
        {
            clientIdGenerator: (_, req) => {
                switch (req.headers.authorization) {
                    case "123":
                        return "123";
                    default:
                        return "";
                }
            },
            path: "/",
        },
    );
    const messageList: { [key: string]: string[] } = {};
    SERVICE.on("message", (id: string, data: RawData, isBinary: boolean) => {
        messageList[id].push(data.toString(isBinary ? "utf-8" : "hex"));
        setTimeout(() => {
            void SERVICE.post(id, "hello world!");
        }, Integer.random(50, 1000));
    })
        .on("connect", (id) => {
            messageList[id] = [];
        })
        .on("close", (id) => {
            messageList[id] && delete messageList[id];
        })
        .on("ping", (id) => {
            setTimeout(() => {
                void SERVICE.pong(id);
            }, Integer.random(50, 1000));
        })
        .on("pong", (id) => {
            messageList[id].push("pong");
        });

    beforeAll(async () => {
        await SERVICE.starting();
    });

    afterAll(async () => {
        await SERVICE.close();
    });

    describe("send message", () => {
        afterEach(async () => {
            await TimerTools.sleep(1000);
        }, 10000);

        it("send message", async () => {
            const messages: string[] = [];
            const client = new TIANYU.import.MODULE.Net.WSClient("ws://localhost:60005", undefined, {
                headers: {
                    authorization: "123",
                },
            });
            expect(client.id).not.toEqual("");
            expect(client["remote"].address).toEqual("ws://localhost");
            expect(client["remote"].port).toEqual(60005);

            client.on("message", (data) => {
                messages.push(data.toString("utf-8"));
            });

            await client.connecting();
            await client.send(Buffer.from("hello", "utf-8"));

            await TimerTools.sleep(2000);
            expect(messageList["123"]?.[0]).toEqual("hello");
            expect(messages[0]).toEqual("hello world!");

            await client.close();
        }, 200000);

        it("connect with URL", async () => {
            const messages: string[] = [];
            const client = new TIANYU.import.MODULE.Net.WSClient(new URL("ws://localhost:60005"), undefined, {
                headers: {
                    authorization: "123",
                },
            });
            expect(client.id).not.toEqual("");

            client.on("message", (data) => {
                messages.push(data.toString("utf-8"));
            });

            await client.connecting();
            await client.send(Buffer.from("hello", "utf-8"));

            await TimerTools.sleep(2000);
            expect(messageList["123"]?.[0]).toEqual("hello");
            expect(messages[0]).toEqual("hello world!");

            await client.close();
        }, 200000);

        it("send with error", (done) => {
            const client = new TIANYU.import.MODULE.Net.WSClient("ws://localhost:60005");

            void client.connecting().finally(async () => {
                await client.close();

                await TimerTools.sleep(1500);

                client.send(Buffer.from("")).then(
                    () => done.fail(),
                    () => done(),
                );
            });
        }, 200000);

        it("long connection", async () => {
            const messages: string[] = [];
            const client = new TIANYU.import.MODULE.Net.WSClient("ws://localhost:60005", undefined, {
                headers: {
                    authorization: "123",
                },
            });
            expect(client.id).not.toEqual("");

            client.on("message", (data) => {
                messages.push(data.toString("utf-8"));
            });

            await client.connecting();
            await client.send(Buffer.from("hello", "utf-8"));

            await TimerTools.sleep(1500);
            expect(messageList["123"]?.[0]).toEqual("hello");
            expect(messages[0]).toEqual("hello world!");

            await client.send(Buffer.from("hello-1", "utf-8"));
            await TimerTools.sleep(2000);
            expect(messageList["123"]?.[1]).toEqual("hello-1");
            expect(messages[1]).toEqual("hello world!");

            await client.send(Buffer.from("hello-2", "utf-8"));
            await TimerTools.sleep(2000);
            expect(messageList["123"]?.[2]).toEqual("hello-2");
            expect(messages[2]).toEqual("hello world!");

            await client.close();
        }, 500000);
    });

    it("ping with error", (done) => {
        const client = new TIANYU.import.MODULE.Net.WSClient("ws://localhost:60005");

        void client.connecting().finally(async () => {
            await client.close();

            await TimerTools.sleep(1500);

            client.ping().then(
                () => done.fail(),
                () => done(),
            );
        });
    }, 200000);

    it("pong with error", (done) => {
        const client = new TIANYU.import.MODULE.Net.WSClient("ws://localhost:60005");

        void client.connecting().finally(async () => {
            await client.close();

            await TimerTools.sleep(1500);

            client.pong().then(
                () => done.fail(),
                () => done(),
            );
        });
    }, 200000);

    it("long connection - 1", async () => {
        const messages: string[] = [];
        const client = new TIANYU.import.MODULE.Net.WSClient("ws://localhost:60005", undefined, {
            headers: {
                authorization: "123",
            },
        });
        client.on("ping", () => {
            void client.pong(Buffer.from("pong", "utf-8"));
        });
        client.on("pong", () => {
            messages.push("pong");
        });
        expect(client.id).not.toEqual("");

        client.on("message", (data) => {
            messages.push(data.toString("utf-8"));
        });

        await client.connecting();
        await client.send(Buffer.from("hello", "utf-8"));

        await TimerTools.sleep(1500);
        expect(messageList["123"]?.[0]).toEqual("hello");
        expect(messages[0]).toEqual("hello world!");

        await client.ping();
        await TimerTools.sleep(2000);
        expect(messages[1]).toEqual("pong");

        await SERVICE.ping("123");
        await TimerTools.sleep(2000);
        expect(messageList["123"]?.[1]).toEqual("pong");

        await client.close();
    }, 500000);

    it("connection error", (done) => {
        const client = new TIANYU.import.MODULE.Net.WSClient("ws://localhost", undefined, {
            headers: {
                authorization: "123",
            },
        });

        client.connecting().then(
            () => done.fail(),
            () => {
                expect(client["remote"].port).toEqual(80);
                done();
            },
        );
    });
});

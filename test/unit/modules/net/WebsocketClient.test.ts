/** @format */

import { Integer } from "#base/index";
import { WSService } from "#core/service/net";
import { TimerTools } from "test/tools/TimerTools";
import { RawData } from "ws";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.net.WebsocketClient", () => {
    const SERVICE = new WSService(
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
        it("send message", async () => {
            const messages: string[] = [];
            const client = new TIANYU.import.MODULE.Net.WSClient("ws://localhost:60005", undefined, {
                headers: {
                    authorization: "123",
                },
            });
            expect(client.id).not.toEqual("");

            client.onData = (data) => {
                messages.push(data.toString("utf-8"));
            };

            await client.connect();
            await client.send(Buffer.from("hello", "utf-8"));

            await TimerTools.sleep(4000);
            expect(messageList["123"]?.[0]).toEqual("hello");
            expect(messages[0]).toEqual("hello world!");

            await client.close();
        }, 200000);

        it("send with error", (done) => {
            const client = new TIANYU.import.MODULE.Net.WSClient("ws://localhost:60005");

            void client.connect().finally(async () => {
                await client.close();

                await TimerTools.sleep(3000);

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

            client.onData = (data) => {
                messages.push(data.toString("utf-8"));
            };

            await client.connect();
            await client.send(Buffer.from("hello", "utf-8"));

            await TimerTools.sleep(3000);
            expect(messageList["123"]?.[0]).toEqual("hello");
            expect(messages[0]).toEqual("hello world!");

            await client.send(Buffer.from("hello-1", "utf-8"));
            await TimerTools.sleep(4000);
            expect(messageList["123"]?.[1]).toEqual("hello-1");
            expect(messages[1]).toEqual("hello world!");

            await client.send(Buffer.from("hello-2", "utf-8"));
            await TimerTools.sleep(4000);
            expect(messageList["123"]?.[2]).toEqual("hello-2");
            expect(messages[2]).toEqual("hello world!");

            await client.close();
        }, 500000);
    });

    it("ping with error", (done) => {
        const client = new TIANYU.import.MODULE.Net.WSClient("ws://localhost:60005");

        void client.connect().finally(async () => {
            await client.close();

            await TimerTools.sleep(3000);

            client.ping().then(
                () => done.fail(),
                () => done(),
            );
        });
    }, 200000);

    it("pong with error", (done) => {
        const client = new TIANYU.import.MODULE.Net.WSClient("ws://localhost:60005");

        void client.connect().finally(async () => {
            await client.close();

            await TimerTools.sleep(3000);

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
        client.onPing = () => {
            void client.pong(Buffer.from("pong", "utf-8"));
        };
        client.onPong = () => {
            messages.push("pong");
        };
        expect(client.id).not.toEqual("");

        client.onData = (data) => {
            messages.push(data.toString("utf-8"));
        };

        await client.connect();
        await client.send(Buffer.from("hello", "utf-8"));

        await TimerTools.sleep(3000);
        expect(messageList["123"]?.[0]).toEqual("hello");
        expect(messages[0]).toEqual("hello world!");

        await client.ping();
        await TimerTools.sleep(4000);
        expect(messages[1]).toEqual("pong");

        await SERVICE.ping("123");
        await TimerTools.sleep(4000);
        expect(messageList["123"]?.[1]).toEqual("pong");

        await client.close();
    }, 500000);
});

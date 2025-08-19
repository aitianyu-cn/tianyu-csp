/** @format */

import { WSService } from "#core/service/net";
import { IWSServerConnection, IWSServerRegister, IWSServerUnregister } from "#interface";
import { TimerTools } from "test/tools/TimerTools";
import { RawData } from "ws";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.net.WebsocketClient", () => {
    const registerMap: { [key: string]: IWSServerConnection } = {};
    const messageList: { [key: string]: string[] } = {};
    const fnRegister: IWSServerRegister = (id: string, server: IWSServerConnection) => {
        registerMap[id] = server;
        messageList[id] = [];

        server.on("message", (cid: string, message: RawData, isBinary: boolean) => {
            messageList[cid]?.push(isBinary ? message.toString("utf-8") : message.toString("hex"));
            setTimeout(() => {
                try {
                    void server.post("hello world!");
                } catch {
                    //
                }
            }, 1000);
        });
    };
    const fnUnregister: IWSServerUnregister = (id: string) => {
        registerMap[id] && delete registerMap[id];
        messageList[id] && delete messageList[id];
    };
    const SERVICE = new WSService(
        fnRegister,
        fnUnregister,
        { address: "0.0.0.0", port: 60005 },
        {
            clientIdGenerator: () => "123",
        },
    );

    afterAll(async () => {
        await SERVICE.close();
    });

    it("send message", async () => {
        const messages: string[] = [];
        const client = new TIANYU.import.MODULE.Net.WSClient("ws://localhost:60005");
        expect(client.id).not.toEqual("");

        client.onData = (data) => {
            messages.push(data.toString("utf-8"));
        };

        await client.connect();
        await client.send(Buffer.from("hello", "utf-8"));

        await TimerTools.sleep(3000);
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
        const client = new TIANYU.import.MODULE.Net.WSClient("ws://localhost:60005");
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

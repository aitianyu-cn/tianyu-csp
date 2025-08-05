/** @format */

import { TcpService } from "#core/service/TcpService";
import { ISocketAddress } from "#interface";
import { TcpClient } from "#module";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.service.TcpService", () => {
    const dataHanler = async (remote: ISocketAddress, data: Buffer) => {
        const src = data.toString("utf-8");
        if (src === "Hello") {
            return Buffer.from("Hello World!");
        }
    };

    const connectionHandler = {
        end: () => undefined,
        start: () => undefined,
    };

    let SERVICE: any = null;

    beforeEach((done) => {
        SERVICE = new TcpService({
            address: "0.0.0.0",
            port: 60001,
        });

        SERVICE.onData = dataHanler;
        SERVICE.onConnected = connectionHandler.start;
        SERVICE.endConnection = connectionHandler.end;

        SERVICE.listen(() => {
            expect(SERVICE.listening).toBeTruthy();
            done();
        });
    });

    afterEach((done) => {
        SERVICE.close(done);
    });

    it("has response message", async () => {
        let dataStr = "";

        const client = new TcpClient({ log: true });
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
        SERVICE._service.emit("error", new Error());
        expect(ERROR_SPY).toHaveBeenCalled();
    });

    it("duplicate closing not cause error", async () => {
        await new Promise<void>((resolve) => {
            SERVICE.close(resolve);
        });

        expect(SERVICE.listening).toBeFalsy();

        expect(() => {
            SERVICE.close();
        }).not.toThrow();
    });
});

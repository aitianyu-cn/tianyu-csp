/** @format */

import { UdpService } from "#core/service/UdpService";
import { ISocketAddress, UdpClientResponse } from "#interface";
import { UdpClient } from "#module";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.service.UdpService", () => {
    const messageHandler = (remote: ISocketAddress, message: Buffer) => {
        const src = message.toString("utf-8");
        if (src === "Hello") {
            return Buffer.from("Hello World!");
        }
    };

    let SERVICE: any = null;

    beforeEach((done) => {
        SERVICE = new UdpService({
            address: "0.0.0.0",
            port: 60000,
        });
        SERVICE.onData = messageHandler;
        SERVICE.listen(done);
    });

    afterEach((done) => {
        SERVICE.close(done);
    });

    it("type", () => {
        expect(SERVICE.type).toEqual("udp");
    });

    it("receive message with return", async () => {
        const response = await UdpClient(Buffer.from("Hello"), {
            remote: {
                address: "127.0.0.1",
                port: 60000,
            },
            family: "IPv4",
            response: true,
            log: true,
        });

        expect(response).toBeDefined();
        expect((response as UdpClientResponse).data.toString("utf-8")).toEqual("Hello World!");
    });

    it("receive message without return", async () => {
        const response = await UdpClient(Buffer.from("single side request"), {
            remote: {
                address: "127.0.0.1",
                port: 60000,
            },
            family: "IPv4",
            log: true,
        });

        expect(response).toBeUndefined();
    });

    it("receive message & send-back failed", (done) => {
        jest.spyOn(SERVICE._service, "send").mockImplementation((_r: any, _p: any, _addr: any, callback: any) => {
            callback(new Error());
        });
        jest.spyOn(TIANYU.logger, "error").mockImplementation(async () => {
            done();
        });

        void UdpClient(Buffer.from("Hello"), {
            remote: {
                address: "127.0.0.1",
                port: 60000,
            },
            family: "IPv4",
            log: true,
        });
    });

    it("server has error", () => {
        jest.spyOn(SERVICE._service, "close").mockImplementationOnce(() => {});
        jest.spyOn(TIANYU.logger, "error");

        SERVICE._service.emit("error", new Error());

        expect(SERVICE._service.close).toHaveBeenCalled();
        expect(TIANYU.logger.error).toHaveBeenCalled();
    });

    it("test - IPv6 service", async () => {
        const service = new UdpService(
            {
                address: "::",
                port: 60000,
            },
            "IPv6",
        );
        service.onData = messageHandler;
        await new Promise<void>((resolve) => {
            service.listen(resolve);
        });

        const response = await UdpClient(Buffer.from("Hello"), {
            remote: {
                address: "::",
                port: 60000,
            },
            family: "IPv6",
            response: true,
            log: true,
        });

        expect(response).toBeDefined();
        expect((response as UdpClientResponse).data.toString("utf-8")).toEqual("Hello World!");

        await new Promise<void>((resolve) => {
            service.close(() => {
                resolve();
            });
        });
    });
});

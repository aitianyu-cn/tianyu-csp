/** @format */

import { TcpClient } from "#module";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.TcpClient", () => {
    it("connect with error", (done) => {
        jest.spyOn(TIANYU.logger, "error");
        const client = new TcpClient({ log: true });
        client
            .connect({
                host: "255.255.255.0",
                port: 60004,
            })
            .then(
                () => {
                    done.fail();
                },
                () => {
                    expect(TIANYU.logger.error).toHaveBeenCalled();
                    done();
                },
            );
    });

    it("send with error", (done) => {
        jest.spyOn(TIANYU.logger, "error");
        const client = new TcpClient({ log: true });
        client.send(Buffer.from("test")).then(
            () => {
                done.fail();
            },
            () => {
                expect(TIANYU.logger.error).toHaveBeenCalled();
                done();
            },
        );
    });

    it("client error", () => {
        const fnErrorHandler = jest.fn();
        const client = new TcpClient({ log: true });
        client.onError = fnErrorHandler;
        client["_client"].emit("error", true);
        expect(fnErrorHandler).toHaveBeenCalled();
    });
});

/** @format */

import { Net } from "#module";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.net.TcpClient", () => {
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
});

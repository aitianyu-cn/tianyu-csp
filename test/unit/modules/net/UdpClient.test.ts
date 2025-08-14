/** @format */

import { Net } from "#module";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.net.UdpClient", () => {
    it("send with error", (done) => {
        Net.UdpClient(Buffer.from("test"), {
            remote: {
                address: "255.255.255.255",
                port: 60003,
            },
            family: "IPv4",
            log: true,
        }).then(
            () => {
                done.fail();
            },
            () => {
                done();
            },
        );
    }, 50000);
});

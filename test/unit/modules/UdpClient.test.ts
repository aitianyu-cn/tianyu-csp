/** @format */

import { UdpClient } from "#module";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.UdpClient", () => {
    it("send with error", (done) => {
        UdpClient(Buffer.from("test"), {
            remote: {
                address: "255.255.255.0",
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

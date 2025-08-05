/** @format */

import { AbstractHttpClient } from "packages/modules/AbstractHttpClient";

class ClientImpl extends AbstractHttpClient {
    public async send(): Promise<void> {
        throw new Error("not implentation");
    }
}

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.AbstractHttpClient", () => {
    it("raw", () => {
        const client = new ClientImpl("localhost", "/", "GET");

        client["result"] = "test_result";

        expect(client.raw).toEqual("test_result");
    });

    describe("response", () => {
        it("null", () => {
            const client = new ClientImpl("localhost", "/", "GET");

            client["result"] = "test_result";

            expect(client.response).toBeNull();
        });

        it("null", () => {
            const client = new ClientImpl("localhost", "/", "GET");

            const obj = {
                error: ["non-error"],
                body: "test",
            };

            client["result"] = JSON.stringify(obj);

            expect(client.response).toEqual(obj);
        });
    });

    it("setParameter", () => {
        const client = new ClientImpl("localhost", "/", "GET");

        client["param"] = {
            p1: ["p1"],
        };

        client.setParameter({ p2: ["p2"] });

        expect(client["param"]).toEqual({
            p1: ["p1"],
            p2: ["p2"],
        });
    });

    it("setHeader", () => {
        const client = new ClientImpl("localhost", "/", "GET");

        client["header"] = {
            p1: "p1",
        };

        client.setHeader({ p2: "p2" });

        expect(client["header"]).toEqual({
            p1: "p1",
            p2: "p2",
        });
    });

    it("setCookie", () => {
        const client = new ClientImpl("localhost", "/", "GET");

        client["cookies"] = {
            p1: "p1",
        };

        client.setCookie({ p2: "p2" });

        expect(client["cookies"]).toEqual({
            p1: "p1",
            p2: "p2",
        });
    });

    it("setPort", () => {
        const client = new ClientImpl("localhost", "/", "GET");

        client.setPort(32000);

        expect(client["port"]).toEqual(32000);
    });

    it("setBody", () => {
        const client = new ClientImpl("localhost", "/", "GET");

        client.setBody({ o: 1 });

        expect(client["body"]).toEqual({ o: 1 });
    });

    it("allHeader", () => {
        const client = new ClientImpl("localhost", "/", "GET");

        client["responseHeaders"] = { cookie: "TEST=t;" };

        expect(client.allHeaders()).toEqual({ cookie: "TEST=t;" });
    });
});

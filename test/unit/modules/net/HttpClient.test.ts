/** @format */

import { createServer } from "@aitianyu.cn/server-base";
import { IncomingMessage, Server, ServerResponse } from "http";
import { TimerTools } from "test/tools/TimerTools";
import { gzipSync } from "zlib";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.net.HttpClient", () => {
    let server: Server;

    const handler = {
        get: jest.fn(),
        post: jest.fn(),
        error: jest.fn(),
    };

    beforeAll(async () => {
        server = createServer(handler.get, handler.post, handler.error);
        server.listen(32000, "localhost");

        // waiting for server port established
        await TimerTools.sleep(1000);
    }, 50000);

    afterAll(async () => {
        server.close();

        // waiting for server closed
        await TimerTools.sleep(1000);
    }, 50000);

    it("http success 1", async () => {
        const client = new TIANYU.import.MODULE.Net.HttpClient("localhost", "", "GET");
        client.setPort(32000);

        handler.get.mockImplementation((req: IncomingMessage, res: ServerResponse) => {
            res.setHeader("content-type", "text/plain");
            res.statusCode = 200;
            res.write("success");
            res.end();
        });

        await client.send();
        expect(client.raw).toEqual("success");
        expect(client.allHeaders()["content-type"]).toEqual("text/plain");
    });

    it("http success 2", async () => {
        const client = new TIANYU.import.MODULE.Net.HttpClient("localhost", "/test-path", "GET");
        client.setPort(32000);
        client.setCookie({ LANG: "zh_CN" });
        client.setHeader({ cookie: "SESSION=123456789;" });
        client.setParameter({ p1: ["p1"] });

        let path = "";
        let cookie = "";

        handler.get.mockImplementation((req: IncomingMessage, res: ServerResponse) => {
            path = req.url || "";
            cookie = req.headers["cookie"] || "";

            res.statusCode = 200;
            res.write("success");
            res.end();
        });

        await client.send();

        expect(client.raw).toEqual("success");
        expect(path).toEqual("/test-path?p1=p1");
        expect(cookie).toEqual("SESSION=123456789;LANG=zh_CN;");
    });

    it("http success 3 - post", async () => {
        const client = new TIANYU.import.MODULE.Net.HttpClient("localhost", "/test-path", "POST");
        client.setPort(32000);
        client.setBody({ test: "test" });

        let body = "";

        handler.post.mockImplementation((req: IncomingMessage, res: ServerResponse) => {
            req.on("data", (chunk) => {
                body += chunk;
            });

            req.on("end", () => {
                res.statusCode = 200;
                res.write("success");
                res.end();
            });
        });

        await client.send();

        expect(client.raw).toEqual("success");
        expect(body).toEqual(JSON.stringify({ test: "test" }));
    });

    it("http success 4 - post", async () => {
        const client = new TIANYU.import.MODULE.Net.HttpClient("localhost", "/test-path", "POST");
        client.setPort(32000);

        let body = "";

        handler.post.mockImplementation((req: IncomingMessage, res: ServerResponse) => {
            req.on("data", (chunk) => {
                body += chunk;
            });

            req.on("end", () => {
                res.statusCode = 200;
                res.write("success");
                res.end();
            });
        });

        await client.send();

        expect(client.raw).toEqual("success");
        expect(body).toEqual("");
    });

    it("http success 5 - gzip", async () => {
        const client = new TIANYU.import.MODULE.Net.HttpClient("localhost", "/test-path", "POST");
        client.setPort(32000);
        client.setHeader({ "accept-encoding": "gzip" });

        let body = "";

        handler.post.mockImplementation((req: IncomingMessage, res: ServerResponse) => {
            req.on("data", (chunk) => {
                body += chunk;
            });

            req.on("end", () => {
                res.statusCode = 200;
                res.setHeader("content-encoding", "gzip");
                res.write(gzipSync("success"));
                res.end();
            });
        });

        await client.send();

        expect(client.raw).toEqual("success");
        expect(body).toEqual("");
    });

    it("failed 1", (done) => {
        const client = new TIANYU.import.MODULE.Net.HttpClient("localhost", "", "GET");
        client.setPort(32000);

        handler.get.mockImplementation((req: IncomingMessage, res: ServerResponse) => {
            res.statusCode = 404;
            res.write("failed");
            res.end();
        });

        client.send().then(
            () => {
                done.fail();
            },
            (error) => {
                expect(error).toEqual(404);
                expect(client.raw).toEqual("failed");
                done();
            },
        );
    });

    it("failed 2", (done) => {
        const client = new TIANYU.import.MODULE.Net.HttpClient("localhost", "", "GET");
        client.setPort(10000);

        handler.get.mockImplementation((req: IncomingMessage, res: ServerResponse) => {
            res.statusCode = 404;
            res.write("failed");
            res.end();
        });

        client.send().then(
            () => {
                done.fail();
            },
            () => {
                expect(handler.get).not.toHaveBeenCalled();
                done();
            },
        );
    });
});

/** @format */

import { FileStreamOperator } from "#core/service/io/file";
import { IOFilePath } from "#interface";
import { FileHelper } from "#utils";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.service.io.file.FileStreamOperator", () => {
    const STATIC_FILE: IOFilePath = {
        type: "internal",
        path: "test/content/file/file-stream-operator-test.txt",
    };

    it("open a file", async () => {
        const fileOp = new FileStreamOperator(STATIC_FILE);

        await fileOp.open();

        expect(fileOp.isOpened).toBeTruthy();
        expect(fileOp.modified).toBeFalsy();
        expect(fileOp.position).toEqual(0);
        expect(fileOp.size).toEqual(24);

        await fileOp.close();
    });

    it("read a file", async () => {
        const fileOp = new FileStreamOperator(STATIC_FILE);

        await fileOp.open();

        const buffer = await fileOp.read(30);
        expect(buffer.byteLength).toEqual(24);
        expect(fileOp.position).toEqual(24);

        await fileOp.close();
    });

    const file_package: IOFilePath = {
        type: "internal",
        path: "test/content/file/file-stream-operator-test2.txt",
    };

    describe("dynamic file testing", () => {
        beforeEach(async () => {
            FileHelper.exist(file_package) && (await FileHelper.remove(file_package));
        });

        afterEach(async () => {
            FileHelper.exist(file_package) && (await FileHelper.remove(file_package));
        });

        describe("write", () => {
            it("multi-write", async () => {
                const fileOp = new FileStreamOperator(file_package, "rw_create");
                await fileOp.open();
                expect(fileOp.size).toEqual(0);

                await fileOp.write(Buffer.from("1"));
                expect(fileOp.modified).toBeTruthy();
                expect(fileOp.position).toEqual(1);

                await fileOp.write(Buffer.from("2"));
                expect(fileOp.position).toEqual(2);

                await fileOp.flush();
                expect(fileOp.size).toEqual(2);

                await fileOp.close();
            });
        });

        describe("close", () => {
            it("no saved test", (done) => {
                const fileOp = new FileStreamOperator(file_package, "rw_create");

                fileOp.open().then(async () => {
                    expect(fileOp.size).toEqual(0);

                    await fileOp.write(Buffer.from("1"));
                    expect(fileOp.modified).toBeTruthy();
                    expect(fileOp.position).toEqual(1);

                    fileOp.close(true).then(
                        () => {
                            done.fail();
                        },
                        async () => {
                            await fileOp.close();
                            done();
                        },
                    );
                }, done.fail);
            });
        });

        describe("setLength", () => {
            it("normal case", async () => {
                const fileOp = new FileStreamOperator(file_package, "write_create");
                await fileOp.open();

                await fileOp.write(Buffer.from("1234567890"));
                await fileOp.flush();

                expect(fileOp.size).toEqual(10);

                await fileOp.setLength(4);
                expect(fileOp.size).toEqual(4);

                await fileOp.close();
            });
        });
    });

    it("seek", async () => {
        const fileOp = new FileStreamOperator(STATIC_FILE, "read_write");
        await fileOp.open();

        fileOp.seek(10);

        expect((await fileOp.read(3)).toString("utf-8")).toEqual("abc");

        fileOp.seek();
        expect((await fileOp.read(3)).toString("utf-8")).toEqual("123");

        fileOp.seek(100);
        expect(fileOp.position).toEqual(24);

        await fileOp.close();
    });
});

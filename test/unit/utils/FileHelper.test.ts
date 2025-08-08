/** @format */

import fs from "fs";
import { FileHelper } from "#utils";
import path from "path";
import {
    FILE_HELPER_DEFAULT_CREATE_DIR,
    FILE_HELPER_DEFAULT_OPEN_FILE,
    FILE_HELPER_DEFAULT_OPEN_FILE_UNEXIST,
    FILE_HELPER_DEFAULT_READ_FILE,
    FILE_HELPER_DEFAULT_REMOVE_DIR_FAILED,
    FILE_HELPER_DEFAULT_REMOVE_FILE_FAILED,
    FILE_HELPER_DEFAULT_SET_LENGTH_FILE,
    FILE_HELPER_DEFAULT_WRITE_FILE,
} from "test/content/file/Constant";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.FileHelper", () => {
    beforeAll(async () => {
        FileHelper.exist(FILE_HELPER_DEFAULT_OPEN_FILE) && (await FileHelper.remove(FILE_HELPER_DEFAULT_OPEN_FILE));
        FileHelper.exist(FILE_HELPER_DEFAULT_OPEN_FILE_UNEXIST) &&
            (await FileHelper.remove(FILE_HELPER_DEFAULT_OPEN_FILE_UNEXIST));
    });

    describe("transformFilePath", () => {
        it("internal file", () => {
            expect(
                FileHelper.transformFilePath({
                    type: "internal",
                    path: "abc/def",
                }),
            ).toEqual(path.join(process.cwd(), "abc/def"));
        });

        it("external file", () => {
            expect(
                FileHelper.transformFilePath({
                    type: "external",
                    path: "abc/def",
                }),
            ).toEqual("abc/def");
        });
    });

    it("transformFileFlag", () => {
        expect(FileHelper.transformFileFlag("append_create")).toEqual("a");
        expect(FileHelper.transformFileFlag("append_read_create")).toEqual("a+");
        expect(FileHelper.transformFileFlag("read")).toEqual("r");
        expect(FileHelper.transformFileFlag("read_write")).toEqual("r+");
        expect(FileHelper.transformFileFlag("rw_create")).toEqual("w+");
        expect(FileHelper.transformFileFlag("write_create")).toEqual("w");
        expect(FileHelper.transformFileFlag("avc" as any)).toEqual("w+");
    });

    describe("open", () => {
        beforeAll(async () => {
            const fd = await FileHelper.open(FILE_HELPER_DEFAULT_OPEN_FILE, "rw_create");
            await FileHelper.close(fd);
        });

        afterAll(async () => {
            await FileHelper.remove(FILE_HELPER_DEFAULT_OPEN_FILE).catch(() => undefined);
        });

        it("open exist file", (done) => {
            FileHelper.open(FILE_HELPER_DEFAULT_OPEN_FILE, "read").then(
                (fd: number) => {
                    FileHelper.close(fd).then(done, () => done.fail());
                },
                () => done.fail(),
            );
        });

        it("open unexist file", (done) => {
            FileHelper.open(FILE_HELPER_DEFAULT_OPEN_FILE_UNEXIST, "read").then(
                () => {
                    done.fail();
                },
                () => {
                    done();
                },
            );
        });
    });

    describe("read", () => {
        it("read file with path", (done) => {
            const buffer = Buffer.alloc(12, 0x00);
            FileHelper.read(
                FILE_HELPER_DEFAULT_READ_FILE,
                {
                    buffer,
                    start: 0,
                    length: 3,
                },
                3,
            ).then(
                (bytes) => {
                    expect(bytes).toEqual(3);
                    expect(buffer.toString("utf-8", 0, 3)).toEqual("def");
                    done();
                },
                () => done.fail(),
            );
        });

        it("read file with fd", (done) => {
            FileHelper.open(FILE_HELPER_DEFAULT_READ_FILE, "read").then(
                (fd) => {
                    const buffer = Buffer.alloc(12, 0x00);
                    FileHelper.read(
                        fd,
                        {
                            buffer,
                            start: 0,
                            length: 3,
                        },
                        6,
                    ).then(
                        (bytes) => {
                            expect(bytes).toEqual(3);
                            expect(buffer.toString("utf-8", 0, 3)).toEqual("ghi");
                            done();
                        },
                        () => done.fail(),
                    );
                },
                () => done.fail(),
            );
        });

        it("read with invalid fd", (done) => {
            jest.spyOn(fs as any, "read").mockImplementation((_1: any, _2: any, _3: any, _4: any, _5: any, fn: any) => {
                fn(new Error());
            });
            const buffer = Buffer.alloc(12, 0x00);
            FileHelper.read(
                100,
                {
                    buffer,
                    start: 0,
                    length: 3,
                },
                6,
            ).then(
                () => {
                    done.fail();
                },
                () => {
                    done();
                },
            );
        });
    });

    describe("write", () => {
        const buffer = Buffer.from("abcdef");

        beforeEach(async () => {
            FileHelper.exist(FILE_HELPER_DEFAULT_WRITE_FILE) && (await FileHelper.remove(FILE_HELPER_DEFAULT_WRITE_FILE));
        });

        afterEach(async () => {
            FileHelper.exist(FILE_HELPER_DEFAULT_WRITE_FILE) && (await FileHelper.remove(FILE_HELPER_DEFAULT_WRITE_FILE));
        });

        it("write file with path", (done) => {
            FileHelper.write(FILE_HELPER_DEFAULT_WRITE_FILE, {
                buffer,
            }).then(
                () => {
                    const filePath = FileHelper.transformFilePath(FILE_HELPER_DEFAULT_WRITE_FILE);
                    const read = fs.readFileSync(filePath).toString("utf-8");
                    expect(read).toEqual("abcdef");
                    done();
                },
                () => done.fail(),
            );
        });

        it("write file with fd", (done) => {
            FileHelper.open(FILE_HELPER_DEFAULT_WRITE_FILE, "rw_create").then(
                (fd) => {
                    FileHelper.write(fd, {
                        buffer,
                    }).then(
                        async () => {
                            const readBuf = Buffer.alloc(12, 0x00);
                            const length = await FileHelper.read(fd, { buffer: readBuf }, 0);
                            expect(readBuf.toString("utf-8", 0, length)).toEqual("abcdef");
                            done();
                        },
                        () => done.fail(),
                    );
                },
                () => done.fail(),
            );
        });

        it("write file failed", (done) => {
            jest.spyOn(fs as any, "write").mockImplementation((_1: any, _2: any, _3: any, _4: any, _5: any, fn: any) => {
                fn(new Error());
            });
            FileHelper.write(100, {
                buffer,
            }).then(
                async () => {
                    done.fail();
                },
                () => {
                    done();
                },
            );
        });

        it("write file bytes not equals", (done) => {
            jest.spyOn(fs as any, "write").mockImplementation((_1: any, _2: any, _3: any, _4: any, _5: any, fn: any) => {
                fn(null, 1);
            });
            FileHelper.write(100, {
                buffer,
            }).then(
                async () => {
                    done.fail();
                },
                () => {
                    done();
                },
            );
        });

        describe("write over 1024 size", () => {
            const wbuffer = Buffer.alloc(2048, 0xff);
            it("write file failed", (done) => {
                jest.spyOn(fs as any, "write").mockImplementation((_1: any, _2: any, _3: any, _4: any, _5: any, fn: any) => {
                    fn(new Error());
                });
                FileHelper.write(100, {
                    buffer: wbuffer,
                }).then(
                    async () => {
                        done.fail();
                    },
                    () => {
                        done();
                    },
                );
            });

            it("write file bytes not equals", (done) => {
                jest.spyOn(fs as any, "write").mockImplementation((_1: any, _2: any, _3: any, _4: any, _5: any, fn: any) => {
                    fn(null, 1);
                });
                FileHelper.write(100, {
                    buffer: wbuffer,
                }).then(
                    async () => {
                        done.fail();
                    },
                    () => {
                        done();
                    },
                );
            });
        });
    });

    describe("flush", () => {
        it("flush failed", (done) => {
            jest.spyOn(fs, "fsync").mockImplementation((_: number, fn) => {
                fn(new Error());
            });
            FileHelper.flush(100).then(
                () => {
                    done.fail();
                },
                () => {
                    done();
                },
            );
        });
    });

    describe("close", () => {
        it("close failed", (done) => {
            jest.spyOn(fs, "close").mockImplementation((_: number, fn) => {
                fn?.(new Error());
            });
            FileHelper.close(100).then(
                () => {
                    done.fail();
                },
                () => {
                    done();
                },
            );
        });
    });

    describe("mkdir", () => {
        beforeEach(async () => {
            FileHelper.exist(FILE_HELPER_DEFAULT_CREATE_DIR) && (await FileHelper.rmdir(FILE_HELPER_DEFAULT_CREATE_DIR));
        });

        afterEach(async () => {
            FileHelper.exist(FILE_HELPER_DEFAULT_CREATE_DIR) && (await FileHelper.rmdir(FILE_HELPER_DEFAULT_CREATE_DIR));
        });

        it("create new dir successful", (done) => {
            FileHelper.mkdir(FILE_HELPER_DEFAULT_CREATE_DIR).then(
                () => {
                    done();
                },
                () => {
                    done.fail();
                },
            );
        });

        it("create new dir failed", (done) => {
            jest.spyOn(fs as any, "mkdir").mockImplementation((p, o, fn: any) => {
                fn(new Error());
            });
            FileHelper.mkdir(FILE_HELPER_DEFAULT_CREATE_DIR).then(
                () => {
                    done.fail();
                },
                () => {
                    done();
                },
            );
        });
    });

    describe("remove", () => {
        it("failed case", (done) => {
            FileHelper.remove(FILE_HELPER_DEFAULT_REMOVE_FILE_FAILED).then(
                () => {
                    done.fail();
                },
                () => {
                    done();
                },
            );
        });
    });

    describe("rmdir", () => {
        it("failed case", (done) => {
            FileHelper.rmdir(FILE_HELPER_DEFAULT_REMOVE_DIR_FAILED).then(
                () => {
                    done.fail();
                },
                () => {
                    done();
                },
            );
        });
    });

    describe("setLength", () => {
        beforeEach(async () => {
            FileHelper.exist(FILE_HELPER_DEFAULT_SET_LENGTH_FILE) &&
                (await FileHelper.remove(FILE_HELPER_DEFAULT_SET_LENGTH_FILE));
        });

        afterEach(async () => {
            FileHelper.exist(FILE_HELPER_DEFAULT_SET_LENGTH_FILE) &&
                (await FileHelper.remove(FILE_HELPER_DEFAULT_SET_LENGTH_FILE));
        });

        it("change size success", async () => {
            const file = FileHelper.transformFilePath(FILE_HELPER_DEFAULT_SET_LENGTH_FILE);
            fs.writeFileSync(file, Buffer.from("this is a test file string", "utf8"));
            expect(fs.readFileSync(file).toString("utf-8")).toEqual("this is a test file string");
            await FileHelper.setLength(FILE_HELPER_DEFAULT_SET_LENGTH_FILE, 4);
            expect(fs.statSync(file).size).toEqual(4);
            expect(fs.readFileSync(file).toString("utf-8")).toEqual("this");
        });

        it("change size failed", (done) => {
            jest.spyOn(fs as any, "ftruncate").mockImplementation((_1, _2, fn: any) => {
                fn(new Error());
            });
            FileHelper.setLength(
                {
                    type: "external",
                    path: "/a/b/c",
                },
                10,
            ).then(
                () => {
                    done.fail();
                },
                () => {
                    done();
                },
            );
        });
    });
});

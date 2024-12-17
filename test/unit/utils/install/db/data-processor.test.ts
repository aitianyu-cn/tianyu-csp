/** @format */

import { IDatabaseFieldDefine } from "#interface";
import { DBHelper } from "#utils/DBHelper";
import { DataProcessor } from "#utils/install/db/data-processor";
import { MapOfString } from "@aitianyu.cn/types";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.install.db.DataProcessor", () => {
    describe("handleDatas", () => {
        it("src is file and empty", () => {
            jest.spyOn(DataProcessor, "handleDataFile");
            jest.spyOn(DataProcessor, "handleDataArray");

            expect(DataProcessor.process("", "", "mysql", "", [])).toEqual([]);
            expect(DataProcessor.handleDataFile).not.toHaveBeenCalled();
            expect(DataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("src is array and empty", () => {
            jest.spyOn(DataProcessor, "handleDataFile");
            jest.spyOn(DataProcessor, "handleDataArray");

            expect(DataProcessor.process("", "", "mysql", [], [])).toEqual([]);
            expect(DataProcessor.handleDataFile).not.toHaveBeenCalled();
            expect(DataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("is src file", () => {
            jest.spyOn(DataProcessor, "handleDataFile").mockImplementation(() => []);
            jest.spyOn(DataProcessor, "handleDataArray");

            expect(DataProcessor.process("", "", "mysql", "invalid file", [])).toEqual([]);
            expect(DataProcessor.handleDataFile).toHaveBeenCalled();
            expect(DataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("is data array", () => {
            jest.spyOn(DataProcessor, "handleDataFile");
            jest.spyOn(DataProcessor, "handleDataArray").mockImplementation(() => []);

            expect(DataProcessor.process("", "", "mysql", [{}], [])).toEqual([]);
            expect(DataProcessor.handleDataFile).not.toHaveBeenCalled();
            expect(DataProcessor.handleDataArray).toHaveBeenCalled();
        });
    });

    describe("handleDataFile", () => {
        it("is sql file - file not exist", () => {
            jest.spyOn(DataProcessor, "handleDataArray");

            expect(DataProcessor.process("", "", "mysql", "scripts/test/sql/test-data-invalid.sql", [])).toEqual([]);

            expect(DataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("is sql file - file exists", () => {
            jest.spyOn(DataProcessor, "handleDataArray");

            const sqls = DataProcessor.process("", "", "mysql", "scripts/test/sql/test-data.sql", []);
            expect(sqls.length).toEqual(3);
            expect(sqls[0]).toEqual("INSERT INTO `a`.`b` (`f_a`) VALUES ('test-a');");
            expect(sqls[1]).toEqual("INSERT INTO `a`.`b` (`f_a`) VALUES ('test-b');");
            expect(sqls[2]).toEqual("INSERT INTO `a`.`b` (`f_a`) VALUES ('test-c');");

            expect(DataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("not sql file - file not found", () => {
            jest.spyOn(DataProcessor, "handleDataArray");

            expect(DataProcessor.process("", "", "mysql", "scripts/test/sql/json-data-invalid", [])).toEqual([]);

            expect(DataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("not sql file - file data is object", () => {
            jest.spyOn(DataProcessor, "handleDataArray");

            expect(DataProcessor.process("", "", "mysql", "scripts/test/sql/json-data-obj", [])).toEqual([]);

            expect(DataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("not sql file - file data is array", () => {
            jest.spyOn(DataProcessor, "handleDataArray").mockImplementation(() => [""]);

            expect(DataProcessor.process("", "", "mysql", "scripts/test/sql/json-data", []).length).toEqual(1);

            expect(DataProcessor.handleDataArray).toHaveBeenCalled();
        });
    });

    it("formatFieldValue", () => {
        expect(DataProcessor.formatFieldValue(undefined, { type: "bigint", name: "test" })).toEqual("UNDEFINED");
        expect(DataProcessor.formatFieldValue(undefined, { type: "boolean", name: "test" })).toEqual("UNDEFINED");
        expect(DataProcessor.formatFieldValue(undefined, { type: "tinyint", name: "test" })).toEqual("UNDEFINED");
        expect(DataProcessor.formatFieldValue(undefined, { type: "int", name: "test" })).toEqual("UNDEFINED");
        expect(DataProcessor.formatFieldValue(undefined, { type: "float", name: "test" })).toEqual("UNDEFINED");
        expect(DataProcessor.formatFieldValue(undefined, { type: "double", name: "test" })).toEqual("UNDEFINED");
        expect(DataProcessor.formatFieldValue(undefined, { type: "decimal", name: "test" })).toEqual("UNDEFINED");
        expect(DataProcessor.formatFieldValue("321", { type: "decimal", name: "test" })).toEqual("321");

        expect(DataProcessor.formatFieldValue(undefined, { type: "text", name: "test" })).toEqual("UNDEFINED");
        expect(DataProcessor.formatFieldValue(undefined, { type: "longtext", name: "test" })).toEqual("UNDEFINED");
        expect(DataProcessor.formatFieldValue(undefined, { type: "char", name: "test" })).toEqual("UNDEFINED");
        expect(DataProcessor.formatFieldValue(undefined, { type: "varchar", name: "test" })).toEqual("UNDEFINED");

        expect(DataProcessor.formatFieldValue(undefined, { type: "int", name: "test", default: "100" })).toEqual("100");
        expect(DataProcessor.formatFieldValue(undefined, { type: "int", name: "test", zero: true })).toEqual("0");
        expect(DataProcessor.formatFieldValue(undefined, { type: "int", name: "test", nullable: true })).toEqual("NULL");

        expect(DataProcessor.formatFieldValue("test';a`\"", { type: "varchar", name: "test", nullable: true })).toEqual(
            `'${DBHelper.encode("test';a`\"")}'`,
        );
        expect(DataProcessor.formatFieldValue(undefined, { type: "varchar", name: "test", default: "test-data" })).toEqual(
            "'test-data'",
        );
        expect(DataProcessor.formatFieldValue(undefined, { type: "varchar", name: "test", nullable: true })).toEqual("NULL");
    });

    it("handleDataArray", () => {
        const fields: IDatabaseFieldDefine[] = [
            { type: "char", name: "id", size: 50 },
            { type: "char", name: "name", size: 50, nullable: true },
            { type: "int", name: "age", default: "0" },
        ];

        {
            const datas = [
                { id: "id-1", name: "name-1", age: "15" },
                { id: "id-2", name: "name-2", age: "27" },
                { id: "id-3", name: "name-3", age: "31" },
            ];
            const sqls = DataProcessor.handleDataArray("test_db", "test_tb", "mysql", datas, fields);

            expect(sqls.length).toEqual(3);
            expect(sqls[0]).toEqual("INSERT INTO `test_db`.`test_tb` (`id`,`name`,`age`) VALUES ('id-1','name-1',15);");
            expect(sqls[1]).toEqual("INSERT INTO `test_db`.`test_tb` (`id`,`name`,`age`) VALUES ('id-2','name-2',27);");
            expect(sqls[2]).toEqual("INSERT INTO `test_db`.`test_tb` (`id`,`name`,`age`) VALUES ('id-3','name-3',31);");
        }

        {
            const datas: MapOfString[] = [
                { id: "id-1", name: "name-1", age: "15" },
                { id: "id-2", age: "27" },
                { id: "id-3", name: "name-3" },
            ];
            const sqls = DataProcessor.handleDataArray("test_db", "test_tb", "mysql", datas, fields);

            expect(sqls.length).toEqual(3);
            expect(sqls[0]).toEqual("INSERT INTO `test_db`.`test_tb` (`id`,`name`,`age`) VALUES ('id-1','name-1',15);");
            expect(sqls[1]).toEqual("INSERT INTO `test_db`.`test_tb` (`id`,`name`,`age`) VALUES ('id-2',NULL,27);");
            expect(sqls[2]).toEqual("INSERT INTO `test_db`.`test_tb` (`id`,`name`,`age`) VALUES ('id-3','name-3',0);");
        }
    });
});
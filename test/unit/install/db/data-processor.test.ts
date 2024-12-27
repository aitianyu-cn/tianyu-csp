/** @format */

import { IDatabaseFieldDefine } from "#interface";
import { DBHelper } from "#utils/DBHelper";
import { SqlDataProcessor } from "#install/db/processor/sql-data-processor";
import { MapOfString } from "@aitianyu.cn/types";

describe("aitianyu-cn.node-module.tianyu-csp.unit.install.db.DataProcessor", () => {
    describe("handleDatas", () => {
        it("src is file and empty", () => {
            jest.spyOn(SqlDataProcessor, "handleDataFile");
            jest.spyOn(SqlDataProcessor, "handleDataArray");

            expect(SqlDataProcessor.process("", "", "mysql", "", [])).toEqual([]);
            expect(SqlDataProcessor.handleDataFile).not.toHaveBeenCalled();
            expect(SqlDataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("src is array and empty", () => {
            jest.spyOn(SqlDataProcessor, "handleDataFile");
            jest.spyOn(SqlDataProcessor, "handleDataArray");

            expect(SqlDataProcessor.process("", "", "mysql", [], [])).toEqual([]);
            expect(SqlDataProcessor.handleDataFile).not.toHaveBeenCalled();
            expect(SqlDataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("is src file", () => {
            jest.spyOn(SqlDataProcessor, "handleDataFile").mockImplementation(() => []);
            jest.spyOn(SqlDataProcessor, "handleDataArray");

            expect(SqlDataProcessor.process("", "", "mysql", "invalid file", [])).toEqual([]);
            expect(SqlDataProcessor.handleDataFile).toHaveBeenCalled();
            expect(SqlDataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("is data array", () => {
            jest.spyOn(SqlDataProcessor, "handleDataFile");
            jest.spyOn(SqlDataProcessor, "handleDataArray").mockImplementation(() => []);

            expect(SqlDataProcessor.process("", "", "mysql", [{}], [])).toEqual([]);
            expect(SqlDataProcessor.handleDataFile).not.toHaveBeenCalled();
            expect(SqlDataProcessor.handleDataArray).toHaveBeenCalled();
        });
    });

    describe("handleDataFile", () => {
        it("is sql file - file not exist", () => {
            jest.spyOn(SqlDataProcessor, "handleDataArray");

            expect(SqlDataProcessor.process("", "", "mysql", "scripts/test/sql/test-data-invalid.sql", [])).toEqual([]);

            expect(SqlDataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("is sql file - file exists", () => {
            jest.spyOn(SqlDataProcessor, "handleDataArray");

            const sqls = SqlDataProcessor.process("", "", "mysql", "scripts/test/sql/test-data.sql", []);
            expect(sqls.length).toEqual(3);
            expect(sqls[0]).toEqual("INSERT INTO `a`.`b` (`f_a`) VALUES ('test-a');");
            expect(sqls[1]).toEqual("INSERT INTO `a`.`b` (`f_a`) VALUES ('test-b');");
            expect(sqls[2]).toEqual("INSERT INTO `a`.`b` (`f_a`) VALUES ('test-c');");

            expect(SqlDataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("not sql file - file not found", () => {
            jest.spyOn(SqlDataProcessor, "handleDataArray");

            expect(SqlDataProcessor.process("", "", "mysql", "scripts/test/sql/json-data-invalid", [])).toEqual([]);

            expect(SqlDataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("not sql file - file data is object", () => {
            jest.spyOn(SqlDataProcessor, "handleDataArray");

            expect(SqlDataProcessor.process("", "", "mysql", "scripts/test/sql/json-data-obj", [])).toEqual([]);

            expect(SqlDataProcessor.handleDataArray).not.toHaveBeenCalled();
        });

        it("not sql file - file data is array", () => {
            jest.spyOn(SqlDataProcessor, "handleDataArray").mockImplementation(() => [""]);

            expect(SqlDataProcessor.process("", "", "mysql", "scripts/test/sql/json-data", []).length).toEqual(1);

            expect(SqlDataProcessor.handleDataArray).toHaveBeenCalled();
        });
    });

    it("formatFieldValue", () => {
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "bigint", name: "test" })).toEqual("UNDEFINED");
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "boolean", name: "test" })).toEqual("UNDEFINED");
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "tinyint", name: "test" })).toEqual("UNDEFINED");
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "int", name: "test" })).toEqual("UNDEFINED");
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "float", name: "test" })).toEqual("UNDEFINED");
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "double", name: "test" })).toEqual("UNDEFINED");
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "decimal", name: "test" })).toEqual("UNDEFINED");
        expect(SqlDataProcessor.formatFieldValue("321", { type: "decimal", name: "test" })).toEqual("321");

        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "text", name: "test" })).toEqual("UNDEFINED");
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "longtext", name: "test" })).toEqual("UNDEFINED");
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "char", name: "test" })).toEqual("UNDEFINED");
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "varchar", name: "test" })).toEqual("UNDEFINED");

        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "int", name: "test", default: "100" })).toEqual("100");
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "int", name: "test", zero: true })).toEqual("0");
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "int", name: "test", nullable: true })).toEqual("NULL");

        expect(SqlDataProcessor.formatFieldValue("test';a`\"", { type: "varchar", name: "test", nullable: true })).toEqual(
            `'${DBHelper.encode("test';a`\"")}'`,
        );
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "varchar", name: "test", default: "test-data" })).toEqual(
            "'test-data'",
        );
        expect(SqlDataProcessor.formatFieldValue(undefined, { type: "varchar", name: "test", nullable: true })).toEqual("NULL");
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
            const sqls = SqlDataProcessor.handleDataArray("test_db", "test_tb", "mysql", datas, fields);

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
            const sqls = SqlDataProcessor.handleDataArray("test_db", "test_tb", "mysql", datas, fields);

            expect(sqls.length).toEqual(3);
            expect(sqls[0]).toEqual("INSERT INTO `test_db`.`test_tb` (`id`,`name`,`age`) VALUES ('id-1','name-1',15);");
            expect(sqls[1]).toEqual("INSERT INTO `test_db`.`test_tb` (`id`,`name`,`age`) VALUES ('id-2',NULL,27);");
            expect(sqls[2]).toEqual("INSERT INTO `test_db`.`test_tb` (`id`,`name`,`age`) VALUES ('id-3','name-3',0);");
        }
    });
});

/** @format */

import { Field } from "#install/db/mysql/field";

describe("aitianyu-cn.node-module.tianyu-csp.unit.install.db.mysql.Field", () => {
    it("handleType", () => {
        expect(
            Field.handleType({
                type: "bigint",
                name: "test",
            }),
        ).toEqual("`test` BIGINT NOT NULL");
        expect(
            Field.handleType({
                type: "char",
                name: "test",
            }),
        ).toEqual("`test` CHAR(3) NOT NULL");
        expect(
            Field.handleType({
                type: "varchar",
                name: "test",
            }),
        ).toEqual("`test` VARCHAR(3) NOT NULL");
        expect(
            Field.handleType({
                type: "text",
                name: "test",
            }),
        ).toEqual("`test` TEXT NOT NULL");
        expect(
            Field.handleType({
                type: "longtext",
                name: "test",
            }),
        ).toEqual("`test` LONGTEXT NOT NULL");
        expect(
            Field.handleType({
                type: "tinyint",
                name: "test",
            }),
        ).toEqual("`test` TINYINT(3) NOT NULL");
        expect(
            Field.handleType({
                type: "boolean",
                name: "test",
            }),
        ).toEqual("`test` TINYINT(3) NOT NULL");
        expect(
            Field.handleType({
                type: "int",
                name: "test",
            }),
        ).toEqual("`test` INT NOT NULL");
        expect(
            Field.handleType({
                type: "float",
                name: "test",
            }),
        ).toEqual("`test` FLOAT NOT NULL");
        expect(
            Field.handleType({
                type: "double",
                name: "test",
            }),
        ).toEqual("`test` DOUBLE NOT NULL");
        expect(
            Field.handleType({
                type: "decimal",
                name: "test",
            }),
        ).toEqual("`test` DECIMAL(3,0) NOT NULL");

        expect(
            Field.handleType({
                type: "int",
                name: "test",
                unsign: true,
                zero: true,
                nullable: true,
                default: "1",
            }),
        ).toEqual("`test` INT UNSIGNED ZEROFILL NULL DEFAULT '1'");
        expect(
            Field.handleType({
                type: "char",
                name: "test",
                size: 255,
            }),
        ).toEqual("`test` CHAR(255) NOT NULL");
        expect(
            Field.handleType({
                type: "decimal",
                name: "test",
                size: 15,
                decimal: 7,
            }),
        ).toEqual("`test` DECIMAL(15,7) NOT NULL");
    });

    it("handlePrimary", () => {
        expect(Field.handlePrimary([])).toEqual("");

        expect(
            Field.handlePrimary([
                {
                    type: "bigint",
                    name: "test",
                    primary: true,
                },
            ]),
        ).toEqual("PRIMARY KEY (`test`) USING BTREE");

        expect(
            Field.handlePrimary(
                [
                    {
                        type: "bigint",
                        name: "test",
                        primary: true,
                    },
                ],
                "hash",
            ),
        ).toEqual("PRIMARY KEY (`test`) USING HASH");
    });

    it("handleIndex", () => {
        expect(
            Field.handleIndex("", "", {
                type: "bigint",
                name: "test",
            }),
        ).toEqual("");
        expect(
            Field.handleIndex("db", "tb", {
                type: "bigint",
                name: "test",
                index: "btree",
            }),
        ).toEqual("UNIQUE INDEX `db_tb_test_index` (`test`) USING BTREE");
        expect(
            Field.handleIndex("db", "tb", {
                type: "bigint",
                name: "test",
                index: "hash",
            }),
        ).toEqual("UNIQUE INDEX `db_tb_test_index` (`test`) USING HASH");
    });

    it("format", () => {
        expect(
            Field.format("db", "tb", [
                {
                    type: "char",
                    name: "test",
                    index: "hash",
                    primary: true,
                },
            ]),
        ).toEqual("`test` CHAR(3) NOT NULL,PRIMARY KEY (`test`) USING BTREE,UNIQUE INDEX `db_tb_test_index` (`test`) USING HASH");
    });
});

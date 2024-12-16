/** @format */

import { IDatabaseFieldDefine, TableIndexType } from "#interface";
import { StringHelper } from "@aitianyu.cn/types";

export class Field {
    public static format(database: string, table: string, fields: IDatabaseFieldDefine[], index?: TableIndexType): string {
        const formattedFields: string[] = [];
        const formattedIndexs: string[] = [];

        for (const field of fields) {
            const formatted = Field.handleType(field);
            formatted && formattedFields.push(formatted);

            const formattedIndex = Field.handleIndex(database, table, field);
            formattedIndex && formattedIndexs.push(formattedIndex);
        }

        const primary = Field.handlePrimary(fields, index);
        if (primary) {
            formattedFields.push(primary);
        }

        return [...formattedFields, ...formattedIndexs].join(",");
    }

    public static handleType(field: IDatabaseFieldDefine): string {
        const name = "`" + field.name + "`";
        const unsigned = field.unsign ? "UNSIGNED" : "";
        const zerofill = field.zero ? "ZEROFILL" : "";
        const nullable = field.nullable ? "NULL" : "NOT NULL";
        const defaultv = field.default ? `DEFAULT '${field.default}'` : "";
        const length = field.size || 3;

        let result = "";
        switch (field.type) {
            case "bigint":
                result = `${name} BIGINT ${unsigned} ${zerofill} ${nullable} ${defaultv}`.trim();
                break;
            case "char":
                result = `${name} CHAR(${length}) ${nullable} ${defaultv}`.trim();
                break;
            case "varchar":
                result = `${name} VARCHAR(${length}) ${nullable} ${defaultv}`.trim();
                break;
            case "text":
                result = `${name} TEXT ${nullable}`.trim();
                break;
            case "longtext":
                result = `${name} LONGTEXT ${nullable}`.trim();
                break;
            case "tinyint":
            case "boolean":
                result = `${name} TINYINT(${length}) ${unsigned} ${zerofill} ${nullable} ${defaultv}`.trim();
                break;
            case "int":
                result = `${name} INT ${unsigned} ${zerofill} ${nullable} ${defaultv}`.trim();
                break;
            case "float":
                result = `${name} FLOAT ${unsigned} ${zerofill} ${nullable} ${defaultv}`.trim();
                break;
            case "double":
                result = `${name} DOUBLE ${unsigned} ${zerofill} ${nullable} ${defaultv}`.trim();
                break;
            case "decimal":
                const decimal = field.decimal || 0;
                result = `${name} DECIMAL(${length},${decimal}) ${unsigned} ${zerofill} ${nullable} ${defaultv}`.trim();
                break;
        }

        return result.replace(/\s+/g, " ");
    }

    public static handlePrimary(fields: IDatabaseFieldDefine[], index?: TableIndexType): string {
        const primaryKeys = fields.filter((value) => !!value.primary).map((value) => value.name);
        if (!primaryKeys.length) {
            return "";
        }

        return StringHelper.format("PRIMARY KEY (`{0}`) USING {1}", [
            primaryKeys.join("`,`"),
            index === "hash" ? "HASH" : "BTREE",
        ]).replace(/\s+/g, " ");
    }

    public static handleIndex(database: string, table: string, field: IDatabaseFieldDefine): string {
        if (field.index) {
            const name = `${database}_${table}_${field.name}_index`;
            return StringHelper.format("UNIQUE INDEX `{0}` (`{1}`) USING {2}", [
                name,
                field.name,
                field.index === "hash" ? "HASH" : "BTREE",
            ]).replace(/\s+/g, " ");
        }

        return "";
    }
}

/** @format */

import * as fs from "fs";
import path from "path";
import { findActualModule } from "#core/infra/ImporterManager";
import { SupportedDatabaseType, IDatabaseFieldDefine } from "#interface";
import { DBHelper } from "#utils/DBHelper";
import { MapOfString, StringHelper } from "@aitianyu.cn/types";
import { PROJECT_ROOT_PATH } from "../../../Common";
import { INSERT_SQL } from "./sql/common";

export class DataProcessor {
    public static process(
        database: string,
        table: string,
        dbType: SupportedDatabaseType,
        dataSrc: MapOfString[] | string,
        fields: IDatabaseFieldDefine[],
    ): string[] {
        const isSrcFile = typeof dataSrc === "string";
        if ((isSrcFile && !dataSrc) || (!isSrcFile && !dataSrc.length)) {
            return [];
        }

        return isSrcFile
            ? DataProcessor.handleDataFile(database, table, dbType, dataSrc, fields)
            : DataProcessor.handleDataArray(database, table, dbType, dataSrc, fields);
    }

    public static handleDataFile(
        database: string,
        table: string,
        dbType: SupportedDatabaseType,
        file: string,
        fields: IDatabaseFieldDefine[],
    ): string[] {
        const fullPath = path.resolve(PROJECT_ROOT_PATH, file);
        if (fullPath.toLocaleLowerCase().endsWith(".sql")) {
            return DataProcessor.handleDataSqlFile(fullPath); // this is a sql file
        }

        const actulFile = findActualModule(fullPath);
        if (!actulFile) {
            return [];
        }

        const datas = require(actulFile);
        if (!Array.isArray(datas)) {
            return [];
        }

        return DataProcessor.handleDataArray(database, table, dbType, datas, fields);
    }

    public static handleDataArray(
        database: string,
        table: string,
        dbType: SupportedDatabaseType,
        datas: MapOfString[],
        fields: IDatabaseFieldDefine[],
    ): string[] {
        const fieldForSql = fields.map((field) => "`" + field.name + "`").join(",");

        const resultSqls: string[] = [];
        for (const data of datas) {
            const valueToStr = DataProcessor.handleDataItem(data, fields);
            resultSqls.push(StringHelper.format(INSERT_SQL[dbType], [database, table, fieldForSql, valueToStr]));
        }

        return resultSqls;
    }

    public static handleDataItem(data: MapOfString, fields: IDatabaseFieldDefine[]): string {
        const valuesList: string[] = [];
        for (const field of fields) {
            valuesList.push(DataProcessor.formatFieldValue(data[field.name], field));
        }
        return valuesList.join(",");
    }

    public static formatFieldValue(value: string | undefined, field: IDatabaseFieldDefine): string {
        switch (field.type) {
            case "bigint":
            case "boolean":
            case "tinyint":
            case "int":
            case "float":
            case "double":
            case "decimal":
                const validNumber = value || field.default || (field.zero ? "0" : field.nullable ? "NULL" : "UNDEFINED");
                return validNumber;
            case "text":
            case "longtext":
            case "char":
            case "varchar":
                const validValue = typeof value === "string" ? value : field.default;
                return typeof validValue === "string"
                    ? `'${DBHelper.encode(validValue)}'`
                    : field.nullable
                    ? "NULL"
                    : "UNDEFINED";
        }
    }

    private static handleDataSqlFile(file: string): string[] {
        if (!fs.existsSync(file)) {
            return [];
        }

        const sqlSrc = fs.readFileSync(file, "utf-8");
        const sqls = sqlSrc.split(";");
        return sqls
            .map((sql) => sql.replace(/(\r\n|\n|\r)/gm, "") + ";") // to remove \n, \r
            .filter((sql) => !!sql && sql !== ";"); // to remove empty line
    }
}

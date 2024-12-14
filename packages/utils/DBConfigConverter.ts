/** @format */

import { IDatabaseConnectionConfig } from "#interface";
import * as mysql from "mysql";

export class DBConfigConverter {
    public static toMysql(config: IDatabaseConnectionConfig): mysql.ConnectionConfig {
        return Object.assign({}, config);
    }
}

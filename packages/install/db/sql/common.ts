/** @format */

import { SupportedDatabaseType } from "#interface";

export const INSERT_SQL: {
    [key in SupportedDatabaseType]?: string;
} & { default: string } = {
    mysql: "INSERT INTO `{0}`.`{1}` ({2}) VALUES ({3});",
    default: "INSERT INTO `{0}`.`{1}` ({2}) VALUES ({3});",
};

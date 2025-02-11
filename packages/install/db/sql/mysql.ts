/** @format */

export const CHECK_DB_EXIST = "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{0}';";

export const CHECK_TABLE_EXIST =
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '{0}' AND TABLE_NAME = '{1}';";

export const DROP_DATABASE = "DROP DATABASE {0};";

export const CREATE_DATABASE = "CREATE DATABASE {0};";

export const CREATE_TABLE = "CREATE TABLE IF NOT EXISTS `{0}`.`{1}` ({2});";

export const CLEAN_TABLE = "TRUNCATE TABLE `{0}`.`{1}`;";

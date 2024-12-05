/** @format */

export const GlobalTemplateSQL: any = {
    clear: {
        mysql: "TRUNCATE TABLE `{0}`.`{1}`;",
    },
    delete: {
        mysql: "DELETE FROM `{0}`.`{1}` WHERE `user` = '{2}';",
    },
    count: {
        mysql: "SELECT COUNT(*) AS `count` FROM `{0}`.`{1}` WHERE {2};",
    },
};

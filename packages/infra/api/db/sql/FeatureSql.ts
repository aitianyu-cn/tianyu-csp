/** @format */

export const TemplateSQL = {
    selectAll: {
        mysql: "SELECT `id`, `enable`, `desc`, `deps` FROM `{0}`.`{1}` LIMIT {2} OFFSET {3};",
    },
    isActive: {
        mysql: "SELECT `enable` FROM `{0}`.`{1}` WHERE `id` = '{2}';",
    },
    contains: {
        mysql: "SELECT * FROM `{0}`.`{1}` WHERE `id` = '{2}';",
    },
    enable: {
        mysql: "UPDATE `{0}`.`{1}` SET `enable` = 1 WHERE `id` = {2}",
    },
    disable: {
        mysql: "UPDATE `{0}`.`{1}` SET `enable` = 0 WHERE `id` = {2}",
    },
} as any;

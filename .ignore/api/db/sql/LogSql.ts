/** @format */

export const TemplateSQL = {
    push: {
        mysql: "INSERT INTO `{0}`.`{1}` (`user`, `level`, `time`, `msg`) VALUES('{2}', {3}, '{4}', '{5}');",
    },
    select: {
        mysql: "SELECT `user`, `level`, `time`, `msg` FROM `{0}`.`{1}` LIMIT {2} OFFSET {3} WHERE {4};",
    },
} as any;

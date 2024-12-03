/** @format */

export const TemplateSQL: any = {
    push: {
        mysql: "INSERT INTO `{0}`.`{1}` (`user`, `id`, `level`, `time`, `msg`, `error`, `area`) VALUES('{2}', '{3}', {4}, '{5}', '{6}', '{7}', '{8}');",
    },
    select: {
        mysql: "SELECT `id`, `level`, `time`, `msg`, `error`, `area` FROM `{0}`.`{1}` LIMIT {2} OFFSET {3} WHERE {4};",
    },
};

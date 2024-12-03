/** @format */

export const TemplateSQL: any = {
    push: {
        mysql: "INSERT INTO `{0}`.`{1}` (`user`, `project`, `module`, `action`, `time`, `msg`) VALUES('{2}', '{3}', '{4}', '{5}', '{6}', '{7}');",
    },
    select: {
        mysql: "SELECT `project`, `module`, `action`, `time`, `msg` FROM `{0}`.`{1}` LIMIT {2} OFFSET {3} WHERE {4};",
    },
};

/** @format */

const TemplateSQL: any = {
    all: {
        mysql: "SELECT `id`, `email`, `name`, `license`, `team` FROM `{0}`.`{1}`;",
    },

    add: {
        mysql: "INSERT INTO `{0}`.`{1}` (`id`, `email`, `skey`, `name`, `license`, `team`) VALUES ('{2}', '{3}', '{4}', '{5}', '{6}', '{7}');",
    },
    remove: {
        mysql: "DELETE FROM `{0}`.`{1}` WHERE `{2}` = '{3}';",
    },

    change: {
        mysql: "UPDATE `{0}`.`{1}` SET `name` = '{2}', `license` = '{3}', `team` = '{4}' WHERE `id` = '{5}';",
    },
    changeSkey: {
        mysql: "UPDATE `{0}`.`{1}` SET `skey` = '{2}' WHERE `id` = '{5}';",
    },

    search: {
        mysql: "SELECT `id`, `email`, `name`, `license`, `team` FROM `{0}`.`{1}` WHERE `email` like '%{2}%' or `name` like '%{2}%' or `license` like '%{2}%' or `team` like '%{2}%';",
    },
    selectByLicense: {
        mysql: "SELECT `id`, `email`, `name`, `license`, `team` FROM `{0}`.`{1}` WHERE `license` = '{2}';",
    },
    selectByTeam: {
        mysql: "SELECT `id`, `email`, `name`, `license`, `team` FROM `{0}`.`{1}` WHERE FIND_IN_SET('{2}', `team`);",
    },
};

/**
 * @format
 * @type {import('ts-jest').JestConfigWithTsJest}
 * */

const baseConfig = require("./jest.config");

module.exports = {
    ...baseConfig,
    modulePathIgnorePatterns: ["<rootDir>/test/unit/core/infra/db/MysqlService.test.ts"],
};

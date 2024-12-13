/**
 * @format
 * @type {import('ts-jest').JestConfigWithTsJest}
 * */

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    reporters: [
        "default",
        [
            "./node_modules/jest-html-reporters",
            {
                pageTitle: "Tianyu CSP Unit Test",
                publicPath: "test/__report__/unit",
                includeFailureMsg: true,
                expand: true,
                filename: "test-report.html",
            },
        ],
    ],
    coverageDirectory: "test/__report__/coverage",
    setupFilesAfterEnv: ["<rootDir>/test/config/testEnvSetup.ts"],
    resetMocks: true,
    clearMocks: true,
    resetModules: true,
    transform: {
        // "message\\.properties$": "./__test__/config/i18nLoader.js",
    },
    moduleNameMapper: {
        // "^shell$": "<rootDir>/packages/index.ts",
        // "^shell-core/(.*)$": "<rootDir>/packages/shell-core/$1",
        // "^shell-react/(.*)$": "<rootDir>/packages/shell-react/$1",
        // "^shell-ui/(.*)$": "<rootDir>/packages/shell-ui/$1",
        // "^infra/(.*)$": "<rootDir>/packages/infra/$1",
        // "^test/(.*)$": "<rootDir>/__test__/$1",
        "^packages/(.*)$": "<rootDir>/packages/$1",
        "^#core/(.*)$": "<rootDir>/packages/core/$1",
        "^#module/(.*)$": "<rootDir>/packages/modules/$1",
        "^#utils/(.*)$": "<rootDir>/packages/utils/$1",
        "^#job/(.*)$": "<rootDir>/packages/job/$1",

        "^#interface$": "<rootDir>/packages/interface/index.ts",
    },
    // coveragePathIgnorePatterns: coverageIgnorePatterns,
    // transformIgnorePatterns: ["<rootDir>/node_modules/$"],
};

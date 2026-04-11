const path = require('path');

module.exports = {
    testEnvironment: 'node',
    testMatch: [
        '**/test/cli/**/*.test.js'
    ],
    collectCoverageFrom: [
        'src/cli/**/*.js',
        '!src/cli/**/*.test.js'
    ],
    coverageDirectory: 'coverage/cli',
    coverageReporters: ['text', 'lcov', 'html'],
    modulePathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/test/cli/test-data/'
    ],
    testTimeout: 10000,
    setupFilesAfterEnv: [path.join(__dirname, 'setup.js')],
    maxWorkers: 1
};

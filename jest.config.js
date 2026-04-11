module.exports = {
    testEnvironment: 'node',
    testMatch: [
        '**/test/svc/**/*.test.js'
    ],
    collectCoverageFrom: [
        'src/main/services/**/*.js',
        '!src/main/services/**/*.test.js'
    ],
    coverageDirectory: 'coverage/svc',
    coverageReporters: ['text', 'lcov', 'html'],
    modulePathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/test/svc/test-data/'
    ],
    testTimeout: 10000,
    setupFilesAfterEnv: ['./test/svc/setup.js'],
    maxWorkers: 1
};

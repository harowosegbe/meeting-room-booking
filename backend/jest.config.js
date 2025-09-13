module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: ["routes/**/*.js", "models/**/*.js", "middleware/**/*.js", "!tests/**/*.js", "!node_modules/**"],
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["**/tests/**/*.test.js"],
  verbose: true,
  // Add Jest globals
  globals: {
    beforeAll: "readonly",
    afterAll: "readonly",
    beforeEach: "readonly",
    afterEach: "readonly",
    describe: "readonly",
    it: "readonly",
    expect: "readonly",
    test: "readonly",
  },
}

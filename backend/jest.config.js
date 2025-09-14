module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: [
    "routes/**/*.js",
    "models/**/*.js",
    "middleware/**/*.js",
    "!tests/**/*.ts",
    "!tests/**/*.js",
    "!node_modules/**",
  ],
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["**/tests/**/*.test.ts"],
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
};

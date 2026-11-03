// Jest config based on the official Medusa v2 starter.
// TEST_TYPE selects the suite: "unit" | "integration:http" | "integration:modules".
// See docs/adr/024-backend-lint-and-test-tooling.md
const { loadEnv } = require("@medusajs/framework/utils")

loadEnv("test", process.cwd())

// Never bind integration tests to the dev server port (PORT from .env):
// an empty value makes @medusajs/test-utils pick a free port, and dotenv
// does not override variables that are already defined.
process.env.PORT = ""

module.exports = {
  transform: {
    "^.+\\.[jt]s$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", decorators: true },
        },
      },
    ],
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json"],
  modulePathIgnorePatterns: ["dist/", "<rootDir>/.medusa/"],
  setupFiles: ["./integration-tests/setup.js"],
}

if (process.env.TEST_TYPE === "integration:http") {
  module.exports.testMatch = ["**/integration-tests/http/*.spec.[jt]s"]
} else if (process.env.TEST_TYPE === "integration:modules") {
  module.exports.testMatch = ["**/src/modules/*/__tests__/**/*.[jt]s"]
} else if (process.env.TEST_TYPE === "unit") {
  module.exports.testMatch = ["**/src/**/__tests__/**/*.unit.spec.[jt]s"]
}

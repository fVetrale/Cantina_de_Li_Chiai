// ESLint 9 flat config for the Medusa v2 backend.
// See docs/adr/024-backend-lint-and-test-tooling.md
import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: ["dist/**", ".medusa/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
  {
    // CommonJS config/setup files (jest.config.js, integration-tests/setup.js)
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["**/__tests__/**/*.ts", "integration-tests/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  }
)

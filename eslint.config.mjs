import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import noCommentedCodePlugin from "eslint-plugin-no-commented-code";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-commented-code/no-commented-code": "error",
      "no-warning-comments": "warn",
      camelcase: [
        "warn",
        {
          properties: "always",
          ignoreImports: true,
          allow: [
            "given_name",
            "family_name",
            "gamma_id",
            "experimental__runtimeEnv",
          ],
        },
      ],
    },
    plugins: { "no-commented-code": noCommentedCodePlugin },
  },
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

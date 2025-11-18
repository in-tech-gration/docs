import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintJs from "@eslint/js";

export default defineConfig([
  eslintJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["node_modules", "public", "remotes", "dist"],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

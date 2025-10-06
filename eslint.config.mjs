import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  js.configs.recommended,
  {
    // The "files" key is important to apply this configuration to specific files
    files: ["**/*.js", "**/*.mjs"], 
    rules: {
      "linebreak-style": ["error", "unix"], // Enforces LF line endings
    },
  },
];

export default eslintConfig;

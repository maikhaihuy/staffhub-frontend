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
  {
    // The "files" key is important to apply this configuration to specific files.
    // js.configs.recommended (core no-unused-vars/no-undef) must stay scoped to
    // plain JS/MJS - it doesn't understand TS-only constructs (function-type
    // parameter names, react-jsx's automatic React global) and misfires as
    // false positives if applied to .ts/.tsx, which next/typescript already
    // covers with TS-aware equivalents.
    files: ["**/*.js", "**/*.mjs"],
    rules: {
      ...js.configs.recommended.rules,
      "linebreak-style": ["error", "unix"], // Enforces LF line endings
    },
  },
];

export default eslintConfig;

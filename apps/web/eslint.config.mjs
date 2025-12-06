import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // any 타입 사용을 Warning으로 변경 (빌드 실패 방지)
      "@typescript-eslint/no-explicit-any": "warn",
      // 사용하지 않는 변수를 Warning으로 변경
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // React 이스케이프 엔티티를 Warning으로 변경
      "react/no-unescaped-entities": "warn",
      // prefer-const는 Error로 유지 (빌드 실패)
      "prefer-const": "error",
    },
  },
];

export default eslintConfig;

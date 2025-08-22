/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./base.js",
    "next/core-web-vitals",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  plugins: [
    "react",
    "react-hooks",
    "jsx-a11y",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "react/react-in-jsx-scope": "off", // Not needed in Next.js 13+
    "react/prop-types": "off", // We use TypeScript for prop validation
    "jsx-a11y/anchor-is-valid": "off", // Next.js Link component handles this
    "react/no-unescaped-entities": "off",
    "@next/next/no-html-link-for-pages": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
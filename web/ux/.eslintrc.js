module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["prettier", "@typescript-eslint"],
  rules: {
    eqeqeq: "error",
    "no-console": "warn",
    "no-undef": "off",
    "no-unused-vars": "off",
    "prettier/prettier": "error",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "warn",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  ignorePatterns: ["node_modules", "build", "dist", "public"],
  settings: {
    "import/resolver": "node",
  },
};

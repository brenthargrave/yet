module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["prettier", "@typescript-eslint"],
  rules: {
    eqeqeq: "error",
    "no-console": "off",
    "no-undef": "off",
    "prettier/prettier": "error",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["off", { argsIgnorePattern: "^_" }],
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
}

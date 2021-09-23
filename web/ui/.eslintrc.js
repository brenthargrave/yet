module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "airbnb",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["prettier", "react", "react-hooks", "@typescript-eslint"],
  rules: {
    "import/prefer-default-export": "off",
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    // "sort-imports": [
    //   "error",
    //   {
    //     allowSeparatedGroups: true,
    //     ignoreMemberSort: true,
    //   },
    // ],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "import/no-extraneous-dependencies": "off",
    "default-case": "off", // rely on ts
    "no-shadow": "off", // bug: incorrectly flags enum defs
    "consistent-return": "off", // bug: incorrectly flags enum defs
    camelcase: "off",
    "react/jsx-filename-extension": [1, { extensions: [".ts", ".tsx"] }],
    "react/jsx-props-no-spreading": "off",
  },
  settings: {
    "import/resolver": "node",
  },
  // ignore graphql-codegen artifacts
  ignorePatterns: ["**/generated/*.ts"],
}

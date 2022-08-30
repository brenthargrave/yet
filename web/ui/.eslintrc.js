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
    "import/no-extraneous-dependencies": "off",
    "default-case": "off", // rely on ts
    "no-shadow": "off", // bug: incorrectly flags enum defs
    "consistent-return": "off", // bug: incorrectly flags enum defs
    camelcase: "off",
    "react/jsx-filename-extension": [1, { extensions: [".ts", ".tsx"] }],
    "react/jsx-props-no-spreading": "off",
    "no-underscore-dangle": "off",
    // TODO: no-unused-vars: https://git.io/JK36s
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["off", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-empty-interface": "off",
    // prevent single-line arrays
    // "array-element-newline": "always",
    "no-nested-ternary": "off",
    // NOTE: complains when react fn defs begin w/ ternary ops
    "react/function-component-definition": "off",
  },
  settings: {
    "import/resolver": "node",
  },
  // ignore graphql-codegen artifacts
  ignorePatterns: ["**/generated/*.ts"],
}

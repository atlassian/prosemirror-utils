/* eslint-env node */
module.exports = {
  env: {
    browser: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    'ecmaVersion': 2020
  },
  plugins: ['@typescript-eslint'],
  rules: {
    indent: 'off',
    'no-debugger': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-this-alias': 'error',
    '@typescript-eslint/no-empty-function': 'error',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/camelcase': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
  },
  root: true,
};

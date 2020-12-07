module.exports = {
  env: {
    browser: true,
    es6: true,
    jasmine: true,
  },

  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },

  extends: [
    'airbnb-base',
    'plugin:fsd/all',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'fsd',
  ],

  rules: {
    'import/prefer-default-export': 'off',
    'consistent-return': 'off',
    'no-console': 'off',
    'func-names': ['error', 'never'],
    'class-methods-use-this': 'off',
    'import/extensions': ['error', 'never'],
    'lines-between-class-members': ['error', 'always'],
    indent: [2, 2],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'require-jsdoc': 0,
    'fsd/hof-name-prefix': 'error',
    'fsd/no-heavy-constructor': 'error',
    'fsd/jq-cache-dom-elements': 'error',
    'fsd/jq-use-js-prefix-in-selector': 'error',
    'fsd/no-function-declaration-in-event-listener': 'error',
    'fsd/split-conditionals': 'error',
  },
};

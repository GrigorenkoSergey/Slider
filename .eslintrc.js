module.exports = {
  'env': {
    'browser': true,
    'es6': true,
  },
  'extends': [
    'plugin:fsd/all',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 11,
    'sourceType': 'module',
  },
  'plugins': [
    '@typescript-eslint',
    'fsd',
  ],
  'rules': {
    'indent': [2, 2],
    'no-unused-vars': 'off', // проблема при импорте типов
    '@typescript-eslint/no-unused-vars': 'error', // для импорта типов
    'require-jsdoc': 0,
    'fsd/hof-name-prefix': 'error',
    'fsd/no-heavy-constructor': 'error',
    'fsd/jq-cache-dom-elements': 'error',
    'fsd/jq-use-js-prefix-in-selector': 'error',
    'fsd/no-function-declaration-in-event-listener': 'error',
    'fsd/split-conditionals': 'error',
  },
};

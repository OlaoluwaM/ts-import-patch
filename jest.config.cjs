/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const { defaults } = require('jest-config');

module.exports = {
  ...defaults,
  testEnvironment: 'node',
  verbose: true,
  transform: {},
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'mjs'],
  moduleNameMapper: {
    '#ansi-styles':
      '<rootDir>/node_modules/chalk/source/vendor/ansi-styles/index.js',
    '#supports-color':
      '<rootDir>/node_modules/chalk/source/vendor/supports-color/index.js',
  },
};

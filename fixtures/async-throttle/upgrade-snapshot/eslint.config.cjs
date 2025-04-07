const { defineConfig } = require('eslint/config')
const globals = require('globals')

module.exports = defineConfig([
  ...require('@jcoreio/toolchain/eslintConfig.cjs'),
  {
    files: ['test/**'],
    languageOptions: {
      globals: {
        ...globals.es6,
        ...globals.mocha,
        ...globals.node,
      },
    },
  },
  {
    files: ['src/**'],
    languageOptions: {
      globals: {
        ...globals.es6,
      },
    },
  },
])

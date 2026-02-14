const { defineConfig } = require('eslint/config')
const globals = require('globals')

module.exports = defineConfig([
  ...require('@jcoreio/toolchain/eslintConfig.cjs'),
  {
    languageOptions: {
      globals: {
        ...globals.es6,
      },
    },
  },
  {
    files: ['test/**'],
    languageOptions: {
      globals: {
        ...globals.es6,
        ...globals.mocha,
        ...globals.browser,
      },
    },
  },
  {
    files: ['src/simple.js', 'src/index.js'],
    languageOptions: {
      globals: globals.browser,
    },
  },
])

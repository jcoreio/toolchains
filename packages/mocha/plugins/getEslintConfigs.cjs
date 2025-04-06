const { defineConfig } = require('eslint/config')
const noOnlyTests = require('eslint-plugin-no-only-tests')

module.exports = [
  () =>
    defineConfig([
      {
        plugins: { 'no-only-tests': noOnlyTests },
        rules: {
          'no-only-tests/no-only-tests': 'error',
        },
      },
    ]),
]

const { defineConfig } = require('eslint/config')
const noOnlyTests = require('eslint-plugin-no-only-tests')

module.exports = [
  () =>
    defineConfig([
      {
        files: ['**/*.{js,jsx,cjs,cjsx,mjs,mjsx,ts,tsx,mts,mtsx,cts,ctsx'],
        plugins: { 'no-only-tests': noOnlyTests },
        rules: {
          'no-only-tests/no-only-tests': 'error',
        },
      },
    ]),
]

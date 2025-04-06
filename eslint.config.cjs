/* eslint-env node, 2018 */

const { defineConfig, globalIgnores } = require('eslint/config')
const globals = require('globals')

module.exports = defineConfig([
  ...require('@jcoreio/toolchain/eslintConfig.cjs'),
  {
    files: ['packages/**/*.{js,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2018,
      },
    },
    rules: {
      '@jcoreio/implicit-dependencies/no-implicit': [
        'error',
        {
          dev: false,
          peer: true,
          optional: true,
        },
      ],
    },
  },
  {
    files: ['*.{js,cjs}', 'test/**/*.{js,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2018,
      },
    },
    rules: {
      '@jcoreio/implicit-dependencies/no-implicit': [
        'error',
        {
          dev: true,
          peer: true,
          optional: true,
        },
      ],
    },
  },
  globalIgnores(['fixtures/', 'flow-typed/']),
])

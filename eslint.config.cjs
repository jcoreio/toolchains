/* eslint-env node, 2018 */

process.env.JCOREIO_TOOLCHAIN_SELF_TEST = '1'

const { defineConfig, globalIgnores } = require('eslint/config')
const globals = require('globals')

module.exports = defineConfig([
  ...require('@jcoreio/toolchain/eslintConfig.cjs'),
  {
    files: ['packages/**/*.{js,cjs,mjs}'],
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
    files: ['*.{js,cjs,mjs}', 'test/**/*.{js,cjs.mjs}'],
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

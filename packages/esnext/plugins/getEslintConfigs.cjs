const globals = require('globals')
const { defineConfig } = require('eslint/config')
const babelParser = require('@babel/eslint-parser')

module.exports = [
  () =>
    defineConfig([
      {
        files: ['**/*.{js,jsx,mjs,mjsx,cjs,cjsx}'],
        languageOptions: {
          parser: babelParser,
          parserOptions: {
            sourceType: 'unambiguous',
          },
          ecmaVersion: 2018,
          globals: {
            ...globals.es2018,
          },
        },
      },
    ]),
]

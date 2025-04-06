const globals = require('globals')
const { defineConfig } = require('eslint/config')
const babelParser = require('@babel/eslint-parser')

module.exports = [
  () =>
    defineConfig([
      {
        files: ['**/*.{js,mjs,cjs}'],
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

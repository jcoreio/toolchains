const js = require('@eslint/js')
const { defineConfig } = require('eslint/config')
const { includeIgnoreFile } = require('@eslint/compat')
const { projectDir } = require('../util/findUps.cjs')
const path = require('path')
const fs = require('../util/projectFs.cjs')
const { globSync } = require('../util/glob.cjs')

module.exports = [
  () => {
    const gitignores = globSync('**/.gitignore')
    if (fs.pathExistsSync('.eslintignore')) {
      gitignores.push('.eslintignore')
    }
    return defineConfig([
      ...gitignores.map((file) =>
        includeIgnoreFile(path.resolve(projectDir, file))
      ),
      js.configs.recommended,
      {
        files: ['**/*.{js,cjs,mjs}'],
        plugins: {
          '@jcoreio/implicit-dependencies': require('@jcoreio/eslint-plugin-implicit-dependencies'),
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
          'arrow-spacing': 'error',
          'comma-spacing': 'error',
          'computed-property-spacing': ['error', 'never'],
          'eol-last': 'error',
          'jsx-quotes': 'error',
          'keyword-spacing': 'error',
          'key-spacing': [
            'error',
            {
              mode: 'strict',
            },
          ],
          'linebreak-style': 'error',
          'no-console': 'error',
          'no-unused-vars': [
            'error',
            {
              args: 'none',
              varsIgnorePattern: 'React',
            },
          ],
          'no-extra-semi': 'error',
          'no-multi-spaces': 'error',
          'no-multiple-empty-lines': 'error',
          'no-trailing-spaces': 'error',
          'no-unexpected-multiline': 'error',
          'no-unreachable': 'error',
          'no-whitespace-before-property': 'error',
          'object-shorthand': ['error', 'always'],
          'padded-blocks': ['error', 'never'],
          semi: ['error', 'never'],
          'space-before-blocks': ['error', 'always'],
          'space-before-function-paren': [
            'error',
            {
              anonymous: 'always',
              named: 'never',
            },
          ],
          'space-in-parens': ['error', 'never'],
          'space-infix-ops': ['error', { int32Hint: false }],
          'space-unary-ops': [
            'error',
            {
              words: true,
              nonwords: false,
            },
          ],
          'rest-spread-spacing': ['error', 'never'],
        },
      },
      {
        files: ['src/**'],
        ignores: ['**/__tests__/**'],
        plugins: {
          '@jcoreio/implicit-dependencies': require('@jcoreio/eslint-plugin-implicit-dependencies'),
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
      require('eslint-config-prettier'),
    ])
  },
]

const dedent = require('dedent-js')

const { describe, it } = require('mocha')
const { expect } = require('chai')
const t = require('@babel/types')
const addEslintConfigsCodemod = require('../../packages/base/util/addEslintConfigsCodemod.cjs')

describe('addEslintConfigsCodemod', () => {
  it(`works when it doesn't have to add globals`, async () => {
    const source = dedent`
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
      ])
    `

    const newConfigs = [
      ['node', ['test/configure.ts', 'env/dev.cjs']],
      ['es2018', ['.babelrc.cjs']],
    ].map(([env, files]) =>
      t.objectExpression([
        t.objectProperty(
          t.identifier('files'),
          t.arrayExpression(files.map((file) => t.stringLiteral(file)))
        ),
        t.objectProperty(
          t.identifier('languageOptions'),
          t.objectExpression([
            t.objectProperty(
              t.identifier('globals'),
              t.memberExpression(
                t.identifier('globals'),
                /^[_a-z$][_a-z0-9$]*$/.test(env) ?
                  t.identifier(env)
                : t.stringLiteral(env)
              )
            ),
          ])
        ),
      ])
    )

    const actual = await addEslintConfigsCodemod({
      filename: 'eslint.config.cjs',
      source,
      configs: newConfigs,
      requireGlobals: true,
    })
    expect(actual.trim()).to.equal(
      dedent`
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
          files: ['test/configure.ts', 'env/dev.cjs'],
          languageOptions: {
            globals: globals.node,
          },
        },
        {
          files: ['.babelrc.cjs'],
          languageOptions: {
            globals: globals.es2018,
          },
        },
      ])
    `.trim()
    )
  })
  it(`works when it has to add globals`, async () => {
    const source = dedent`
      const { defineConfig, globalIgnores } = require('eslint/config')

      module.exports = defineConfig([
        ...require('@jcoreio/toolchain/eslintConfig.cjs'),
        {
          files: ['packages/**/*.{js,cjs,mjs}'],
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
        }
      ])
    `

    const newConfigs = [
      ['node', ['test/configure.ts', 'env/dev.cjs']],
      ['es2018', ['.babelrc.cjs']],
    ].map(([env, files]) =>
      t.objectExpression([
        t.objectProperty(
          t.identifier('files'),
          t.arrayExpression(files.map((file) => t.stringLiteral(file)))
        ),
        t.objectProperty(
          t.identifier('languageOptions'),
          t.objectExpression([
            t.objectProperty(
              t.identifier('globals'),
              t.memberExpression(
                t.identifier('globals'),
                /^[_a-z$][_a-z0-9$]*$/.test(env) ?
                  t.identifier(env)
                : t.stringLiteral(env)
              )
            ),
          ])
        ),
      ])
    )

    const actual = await addEslintConfigsCodemod({
      filename: 'eslint.config.cjs',
      source,
      configs: newConfigs,
      requireGlobals: true,
    })
    expect(actual.trim()).to.equal(
      dedent`
      const globals = require('globals')
      const { defineConfig, globalIgnores } = require('eslint/config')

      module.exports = defineConfig([
        ...require('@jcoreio/toolchain/eslintConfig.cjs'),
        {
          files: ['packages/**/*.{js,cjs,mjs}'],
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
          files: ['test/configure.ts', 'env/dev.cjs'],
          languageOptions: {
            globals: globals.node,
          },
        },
        {
          files: ['.babelrc.cjs'],
          languageOptions: {
            globals: globals.es2018,
          },
        },
      ])
    `.trim()
    )
  })
})

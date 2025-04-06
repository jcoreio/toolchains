const { describe, it } = require('mocha')
const { expect } = require('chai')
const convertLegacyEslintConfigs = require('../../packages/base/util/convertLegacyEslintConfigs.cjs')
const dedent = require('dedent-js')

describe(`convertLegacyEslintConfigs`, function () {
  it(`basic test`, async function () {
    expect(
      await convertLegacyEslintConfigs({
        'test/.eslintrc': {
          env: {
            mocha: true,
            node: true,
          },
          rules: {
            'no-undef': 0,
          },
        },
      })
    ).to.deep.equal(dedent`
      const { defineConfig } = require('eslint/config')
      const globals = require('globals')

      module.exports = defineConfig([
        ...require('@jcoreio/toolchain/eslintConfig.cjs'),
        {
          files: ['test/**'],
          rules: { 'no-undef': 0 },
          languageOptions: {
            globals: {
              ...globals.mocha,
              ...globals.node,
            },
          },
        },
      ])

      `)
  })
})

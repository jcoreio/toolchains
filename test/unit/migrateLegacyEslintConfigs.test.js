const { describe, it } = require('mocha')
const { expect } = require('chai')
const migrateLegacyEslintConfigs = require('@jcoreio/toolchain/util/migrateLegacyEslintConfigs.cjs')
const dedent = require('dedent-js')

describe(`migrateLegacyEslintConfigs`, function () {
  it(`basic test`, async function () {
    const { migrated, warnings } = await migrateLegacyEslintConfigs({
      'test/.eslintrc': dedent`
          {
            env: {
              mocha: true,
              node: true,
            },
            rules: {
              'no-undef': 0,
            },
          }
        `,
      '.eslintrc.cjs': dedent`
          /* eslint-env node, es2018 */
          module.exports = {
            extends: [require.resolve('@jcoreio/toolchain/eslintConfig.cjs')],
            env: {
              commonjs: true,
              'shared-node-browser': true,
              es2017: true,
            },
            rules: makeRules(),
            overrides: [],
          }
        `,
      'errors/0/.eslintrc.js': dedent`
        const config = {
          env: {
            node: true,
          }
        }
      `,
      'errors/1/.eslintrc.js': dedent`
        module.exports = {
          env: {},
          ...rest,
        }
      `,
      'errors/2/.eslintrc.js': dedent`
        module.exports = {
          env: {
            node: true,
            ...rest,
          },
        }
      `,
      'errors/3/.eslintrc.js': dedent`
        module.exports = {
          settings: {
            react: {
              blah: true,
            }
          },
        }
      `,
      'errors/4/.eslintrc': dedent`
        {
          settings: {
            react: {
              blah: true,
            }
          },
        }
      `,
      'errors/5/.eslintrc.js': dedent`
        module.exports = {
          extends: ['recommended'],
        }
      `,
      'errors/6/.eslintrc.js': dedent`
        module.exports = {
          env: {
            foo: 1,
          }
        }
      `,
    })
    expect(migrated).to.deep.equal(dedent`
      const { defineConfig } = require('eslint/config')
      const globals = require('globals')

      module.exports = defineConfig([
        ...require('@jcoreio/toolchain/eslintConfig.cjs'),
        {
          files: ['test/**'],
          rules: {
            'no-undef': 0,
          },
          languageOptions: {
            globals: {
              ...globals.mocha,
              ...globals.node,
            },
          },
        },
        {
          languageOptions: {
            globals: {
              ...globals.commonjs,
              ...globals['shared-node-browser'],
              ...globals.es2017,
            },
          },
          rules: makeRules(),
        },
      ])

      `)

    expect(warnings).to.deep.equal({
      '.eslintrc.cjs': [
        'migrating config.overrides is not currently supported',
      ],
      'errors/0/.eslintrc.js': ['module.exports = statement not found'],
      'errors/1/.eslintrc.js': [
        'config is not an ObjectExpression or has spread or computed properties',
      ],
      'errors/2/.eslintrc.js': [
        'config.env is not an ObjectExpression or has spread or computed properties',
      ],
      'errors/3/.eslintrc.js': [
        'migrating config.settings is not currently supported',
      ],
      'errors/4/.eslintrc': [
        'migrating config.settings is not currently supported',
      ],
      'errors/5/.eslintrc.js': [
        'config.extends has entries other than base @jcoreio/toolchain eslint config',
      ],
      'errors/6/.eslintrc.js': ['config.env.foo is not a boolean'],
    })
  })
})

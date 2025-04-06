const { name } = require('../package.json')
const path = require('path')
const { format } = require('prettier')
const dedent = require('dedent-js')
const prettierConfig = require('../prettier.config.cjs')

async function convertLegacyEslintConfigs(configs) {
  const hasGlobals = Object.values(configs).some((c) => c.env)
  return format(
    dedent`
      /* eslint-env node, es2018 */
      const { defineConfig } = require('eslint/config')
      ${hasGlobals ? `const globals = require('globals')` : ''}

      module.exports = defineConfig([
        ...require('${name}/eslintConfig.cjs'),
        ${Object.entries(configs)
          .map(
            ([file, { env, rules }]) =>
              dedent`
              {
                files: ${JSON.stringify([path.dirname(file) + '/**'])},${
                  rules
                    ? `
                rules: ${JSON.stringify(rules)},`
                    : ''
                }${
                  env
                    ? `
                languageOptions: {
                  globals: {
                    ${Object.keys(env).map(
                      (key) =>
                        `...globals${/^[_a-z$][_a-z0-9$]*$/.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`}`
                    )},
                  },
                },`
                    : ''
                }
              },
            `
          )
          .join('\n')}
      ])
    `,
    { ...prettierConfig, parser: 'babel' }
  )
}

module.exports = convertLegacyEslintConfigs

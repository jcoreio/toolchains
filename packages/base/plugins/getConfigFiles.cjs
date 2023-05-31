const { name } = require('../package.json')
const dedent = require('dedent-js')
const fs = require('../util/projectFs.cjs')
const JSON5 = require('json5')

async function getRootEslintConfig() {
  if (await fs.pathExists('.eslintrc.json')) {
    return JSON5.parse(await fs.readFile('.eslintrc.json', 'utf8'))
  }
  if (await fs.pathExists('.eslintrc')) {
    return JSON5.parse(await fs.readFile('.eslintrc', 'utf8'))
  }
}

module.exports = [
  async function getConfigFiles() {
    const { env, rules } = (await getRootEslintConfig()) || {}
    const files = {
      '.eslintrc.cjs': dedent`
        /* eslint-env node, es2018 */
        module.exports = {
          extends: [require.resolve('${name}/eslint.config.cjs')],${
        env
          ? `\nenv: ${JSON.stringify(env, null, 2).replace(/\n/gm, '\n  ')},`
          : ''
      }${
        rules
          ? `\nrules: ${JSON.stringify(rules, null, 2).replace(/\n/gm, '\n  ')}`
          : ''
      }
        }
      `,
      'release.config.js': dedent`
        /* eslint-env node, es2018 */
        module.exports = {
          extends: [require.resolve('${name}/release.config.cjs')],
        }
      `,
    }
    for (const file of [
      'commitlint.config.cjs',
      'githooks.cjs',
      'lint-staged.config.cjs',
      'prettier.config.cjs',
    ]) {
      files[file] = dedent`
        /* eslint-env node, es2018 */
        const base = require('${name}/${file}')
        module.exports = {
          ...base,
        }
  
      `
    }
    return files
  },
]

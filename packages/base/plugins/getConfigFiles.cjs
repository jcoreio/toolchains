const { name } = require('../package.json')
const dedent = require('dedent-js')
const execa = require('../util/execa.cjs')

module.exports = [
  async function getConfigFiles() {
    let eslintConfig
    try {
      eslintConfig = JSON.parse(
        (
          await execa('eslint', ['--print-config', 'index.js'], {
            stdio: 'pipe',
          })
        ).stdout.toString()
      )
    } catch (error) {
      // ignore
    }
    const eslintEnv = eslintConfig && eslintConfig.env
    const files = {
      '.eslintrc.js': dedent`
        /* eslint-env node */
        module.exports = {
          extends: [require.resolve('${name}/eslint.config.cjs')],${
        eslintEnv ? `\nenv: ${JSON.stringify(eslintEnv, null, 2)},` : ''
      }
        }
      `,
    }
    for (const file of [
      '.mocharc.cjs',
      'commitlint.config.cjs',
      'githooks.cjs',
      'lint-staged.config.cjs',
      'nyc.config.cjs',
      'prettier.config.cjs',
    ]) {
      files[file] = dedent`
        /* eslint-env node */
        module.exports = {
          ...require('${name}/${file}'),
        }
  
      `
    }
    return files
  },
]

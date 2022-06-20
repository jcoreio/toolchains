const { name } = require('../package.json')
const dedent = require('dedent-js')
const { projectDir } = require('../util/findUps.cjs')
const path = require('path')

module.exports = [
  async function getConfigFiles() {
    let eslintConfig
    try {
      const { ESLint } = require(require.resolve('eslint', {
        paths: [projectDir],
      }))
      const eslint = new ESLint()
      eslintConfig = await eslint.calculateConfigForFile(
        path.join(projectDir, 'index.js')
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

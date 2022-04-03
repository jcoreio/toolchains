const { name } = require('../package.json')
const dedent = require('dedent-js')

module.exports = [
  async function getConfigFiles() {
    const files = {
      '.eslintrc.js': dedent`
        /* eslint-env node */
        module.exports = {
          extends: [require.resolve('${name}/eslint.config.cjs')],
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

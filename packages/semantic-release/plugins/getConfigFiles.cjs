const { name } = require('../package.json')
const dedent = require('dedent-js')

module.exports = [
  async function getConfigFiles() {
    return {
      'release.config.js': dedent`
        /* eslint-env node, es2018 */
        module.exports = {
          extends: [require.resolve('${name}/release.config.cjs')],
        }
      `,
    }
  },
]

const { name } = require('../package.json')
const dedent = require('dedent-js')

module.exports = [
  async function getConfigFiles() {
    return {
      '.babelrc.cjs': dedent`
        /* eslint-env node */
        module.exports = require('${name}/.babelrc.cjs')
      `,
    }
  },
]

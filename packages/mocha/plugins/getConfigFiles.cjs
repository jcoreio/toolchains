const { name } = require('../package.json')
const dedent = require('dedent-js')

module.exports = [
  async function getConfigFiles() {
    const files = {}
    for (const file of ['.mocharc.cjs', 'nyc.config.cjs']) {
      files[file] = dedent`
        /* eslint-env node, es2018 */
        module.exports = {
          ...require('${name}/${file}'),
        }
  
      `
    }
    return files
  },
]

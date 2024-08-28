const { name } = require('../package.json')
const dedent = require('dedent-js')

module.exports = [
  async function getConfigFiles({ fromVersion }) {
    const files = {}
    if (fromVersion) return files
    for (const file of ['.mocharc.cjs', 'nyc.config.cjs']) {
      files[file] = async (existing) =>
        existing && fromVersion
          ? existing
          : dedent`
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

const { name } = require('../package.json')
const dedent = require('dedent-js')

module.exports = [
  async function getConfigFiles() {
    return {
      'toolchain.config.cjs': dedent`
        /* eslint-env node, es2018 */
        module.exports = {
          cjsBabelEnv: { forceAllTransforms: true },
          mjsBabelEnv: { targets: { node: 16 } },
        }
      `,
      '.babelrc.cjs': dedent`
        /* eslint-env node, es2018 */
        module.exports = function (api) {
          const base = require('${name}/.babelrc.cjs')(api)
          return {
            ...base,
          }
        }
      `,
    }
  },
]

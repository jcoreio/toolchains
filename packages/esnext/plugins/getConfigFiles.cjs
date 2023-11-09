const { name } = require('../package.json')
const confirmOutputEsm = require('@jcoreio/toolchain/scripts/migrate/confirmOutputEsm.cjs')
const dedent = require('dedent-js')

module.exports = [
  async function getConfigFiles() {
    return {
      'toolchain.config.cjs': async (existing) => {
        if (existing) return existing
        const outputEsm = await confirmOutputEsm()
        return dedent`
          /* eslint-env node, es2018 */
          module.exports = {
            cjsBabelEnv: { forceAllTransforms: true },
            ${
              outputEsm
                ? `esmBabelEnv: { targets: { node: 16 } }`
                : `outputEsm: false`
            },
          }
        `
      },
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

const { name } = require('../package.json')
const confirmOutputEsm = require('@jcoreio/toolchain/scripts/migrate/confirmOutputEsm.cjs')
const dedent = require('dedent-js')
const hasTSSources = require('@jcoreio/toolchain/util/hasTSSources.cjs')
const hasJSSources = require('@jcoreio/toolchain/util/hasJSSources.cjs')
const initBuildIgnore = require('@jcoreio/toolchain/util/initBuildIgnore.cjs')
const { toolchainPackages } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  [
    async function getConfigFiles({ fromVersion }) {
      return {
        'toolchain.config.cjs': async (existing) => {
          if (existing) return existing
          const outputEsm = await confirmOutputEsm()
          return dedent`
          /* eslint-env node, es2018 */
          module.exports = {
            cjsBabelEnv: { targets: { node: 16 } },
            ${outputEsm ? '' : '// '}esmBabelEnv: { targets: { node: 16 } },
            ${
              outputEsm ? '// ' : ''
            }outputEsm: false, // disables ESM output (default: true)
            buildIgnore: ${JSON.stringify(await initBuildIgnore(), null, 2)},
            hasTypeScriptSources: ${
              toolchainPackages.includes('@jcoreio/toolchain-typescript') ?
                fromVersion ? await hasTSSources()
                : !(await hasJSSources())
              : false
            },
            // esWrapper: true, // outputs ES module wrappers for CJS modules (default: false)
            // sourceMaps: false, // default is true (outputs .map files, also accepts 'inline' or 'both')
            // scripts: {
            //   pretest: 'docker compose up -d',
            //   jsExample: {
            //     description: 'example of running a JS script',
            //     run: async (args = []) => console.log('TEST', ...args),
            //   },
            // }
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
    { after: '@jcoreio/toolchain' },
  ],
]

const { name } = require('../package.json')
const confirmOutputEsm = require('@jcoreio/toolchain/scripts/migrate/confirmOutputEsm.cjs')
const dedent = require('dedent-js')

module.exports = [
  [
    async function getConfigFiles() {
      return {
        'toolchain.config.cjs': async (existing) => {
          if (existing) return existing
          const outputEsm = await confirmOutputEsm()
          return dedent`
          /* eslint-env node, es2018 */
          module.exports = {
            cjsBabelEnv: { forceAllTransforms: true },
            ${outputEsm ? '' : '// '}esmBabelEnv: { targets: { node: 16 } },
            ${
              outputEsm ? '// ' : ''
            }outputEsm: false, // disables ESM output (default: true)
            // esWrapper: true, // outputs ES module wrappers for CJS modules (default: false)
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

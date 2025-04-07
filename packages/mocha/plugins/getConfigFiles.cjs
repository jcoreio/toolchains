const { name } = require('../package.json')
const dedent = require('dedent-js')
const { globExists } = require('@jcoreio/toolchain/util/glob.cjs')
const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')

module.exports = [
  async function getConfigFiles({ fromVersion }) {
    return {
      'nyc.config.cjs': async (existing) =>
        existing && fromVersion ? existing : (
          dedent`
              /* eslint-env node, es2018 */
              const base = require('${name}/nyc.config.cjs')
              module.exports = {
                ...base,
              }

            `
        ),
      '.mocharc.cjs': async (existing) => {
        if (existing && fromVersion) return existing
        const specs = []
        if (await globExists('test')) {
          specs.push('test')
        }
        if (await globExists('src/**/__tests__')) {
          specs.push('src/**/__tests__')
        }
        const specFilePattern = `src/**/*.{test,spec}.{${getPluginsArraySync(
          'sourceExtensions'
        ).join(',')}}`
        if (
          await globExists(specFilePattern, { ignore: 'src/**/__tests__/**' })
        ) {
          specs.push(specFilePattern)
        }
        if (!specs.length) specs.push('test')
        return dedent`
          /* eslint-env node, es2018 */
          const base = require('${name}/.mocharc.cjs')
          const { getSpecs } = require('${name}')
          module.exports = {
            ...base,
            spec: getSpecs(${JSON.stringify(specs, null, 2)}),
          }
    
        `
      },
    }
  },
]

const { name } = require('../package.json')
const dedent = require('dedent-js')
const fs = require('../util/projectFs.cjs')
const JSON5 = require('json5')
const { isMonorepoSubpackage } = require('../util/findUps.cjs')
const getPluginsArraySync = require('../util/getPluginsArraySync.cjs')
const initBuildIgnore = require('../util/initBuildIgnore.cjs')
const convertLegacyEslintConfigs = require('../util/convertLegacyEslintConfigs.cjs')
const { glob } = require('../util/glob.cjs')

module.exports = [
  async function getConfigFiles({ fromVersion }) {
    const files = {
      ...(isMonorepoSubpackage
        ? {}
        : {
            '.npmrc': dedent`
              optional=false
            `,
          }),
      'eslint.config.cjs': async (existing) => {
        if (existing && fromVersion) return existing
        const configs = {}
        for (const file of await glob('**/.eslintrc{,.json}')) {
          configs[file] = JSON5.parse(await fs.readFile(file))
        }
        return convertLegacyEslintConfigs(configs)
      },
      'toolchain.config.cjs': async (existing) => {
        if (existing) return existing
        return dedent`
          /* eslint-env node, es2018 */
          module.exports = {
            buildIgnore: ${JSON.stringify(await initBuildIgnore(), null, 2)},
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
    }
    for (const file of [
      ...(isMonorepoSubpackage ? [] : ['githooks.cjs']),
      'lint-staged.config.cjs',
      'prettier.config.cjs',
    ]) {
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
    const tasks = isMonorepoSubpackage
      ? []
      : await getPluginsArraySync('vscodeTasks')
    const launch = isMonorepoSubpackage
      ? []
      : await getPluginsArraySync('vscodeLaunch')

    if (tasks.length) {
      files['.vscode/tasks.json'] = async (existing) =>
        existing && fromVersion
          ? existing
          : JSON.stringify(
              {
                version: '2.0.0',
                tasks,
              },
              null,
              2
            )
    }
    if (launch.length) {
      files['.vscode/launch.json'] = async (existing) =>
        existing && fromVersion
          ? existing
          : JSON.stringify(
              {
                version: '0.2.0',
                configurations: launch,
              },
              null,
              2
            )
    }

    return files
  },
]

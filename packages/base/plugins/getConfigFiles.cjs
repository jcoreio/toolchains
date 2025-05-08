const { name } = require('../package.json')
const dedent = require('dedent-js')
const fs = require('../util/projectFs.cjs')
const { isMonorepoSubpackage } = require('../util/findUps.cjs')
const getPluginsArraySync = require('../util/getPluginsArraySync.cjs')
const initBuildIgnore = require('../util/initBuildIgnore.cjs')
const migrateLegacyEslintConfigs = require('../util/migrateLegacyEslintConfigs.cjs')
const chalk = require('chalk')
const { glob } = require('../util/glob.cjs')
const semver = require('semver')

module.exports = [
  async function getConfigFiles({ fromVersion }) {
    const files = {
      ...((
        isMonorepoSubpackage ||
        (fromVersion && semver.gte(fromVersion, '5.0.0'))
      ) ?
        {}
      : {
          '.npmrc': dedent`
              optional=false
            `,
        }),
      'eslint.config.cjs': async (existing) => {
        if (existing && fromVersion) return existing
        const configs = {}
        for (const file of await glob('**/.eslintrc{,.json,.js,.cjs}')) {
          configs[file] = await fs.readFile(file)
        }
        const { migrated, warnings } = await migrateLegacyEslintConfigs(configs)
        if (warnings.length) {
          for (const [file, fileWarnings] of Object.entries(warnings)) {
            // eslint-disable-next-line no-console
            console.warn(
              chalk.yellow(
                dedent`
                  WARNING: ${file} could not be completely migrated because of the following:
                    ${fileWarnings.map((w) => `- ${w}`).join('\n  ')} 
                  
                `
              )
            )
          }
        }
        return migrated
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
      'prettier.config.cjs': async (existing) => {
        if (existing) {
          return existing.replace(
            `${name}/prettier.config.cjs`,
            `${name}/prettierConfig.cjs`
          )
        }
        return dedent`
          /* eslint-env node, es2018 */
          const base = require('${name}/prettierConfig.cjs')
          module.exports = {
            ...base,
          }
        `
      },
    }
    for (const file of [
      ...(isMonorepoSubpackage ? [] : ['githooks.cjs']),
      'lint-staged.config.cjs',
    ]) {
      files[file] = async (existing) =>
        existing && fromVersion ? existing : (
          dedent`
            /* eslint-env node, es2018 */
            const base = require('${name}/${file}')
            module.exports = {
              ...base,
            }
          `
        )
    }
    const tasks =
      isMonorepoSubpackage ? [] : await getPluginsArraySync('vscodeTasks')
    const launch =
      isMonorepoSubpackage ? [] : await getPluginsArraySync('vscodeLaunch')

    if (tasks.length) {
      files['.vscode/tasks.json'] = async (existing) =>
        existing && fromVersion ? existing : (
          JSON.stringify(
            {
              version: '2.0.0',
              tasks,
            },
            null,
            2
          )
        )
    }
    if (launch.length) {
      files['.vscode/launch.json'] = async (existing) =>
        existing && fromVersion ? existing : (
          JSON.stringify(
            {
              version: '0.2.0',
              configurations: launch,
            },
            null,
            2
          )
        )
    }

    return files
  },
]

const { name } = require('../package.json')
const dedent = require('dedent-js')
const fs = require('../util/projectFs.cjs')
const JSON5 = require('json5')
const { isMonorepoSubpackage } = require('../util/findUps.cjs')
const getPluginsArraySync = require('../util/getPluginsArraySync.cjs')
const initBuildIgnore = require('../util/initBuildIgnore.cjs')

async function getRootEslintConfig() {
  if (await fs.pathExists('.eslintrc.json')) {
    return JSON5.parse(await fs.readFile('.eslintrc.json', 'utf8'))
  }
  if (await fs.pathExists('.eslintrc')) {
    return JSON5.parse(await fs.readFile('.eslintrc', 'utf8'))
  }
}

module.exports = [
  async function getConfigFiles({ fromVersion }) {
    const { env, rules } = (await getRootEslintConfig()) || {}
    const files = {
      ...(isMonorepoSubpackage
        ? {}
        : {
            '.npmrc': dedent`
              optional=false
            `,
          }),
      '.eslintrc.cjs': async (existing) =>
        existing && fromVersion
          ? existing
          : dedent`
        /* eslint-env node, es2018 */
        module.exports = {
          extends: [require.resolve('${name}/eslintConfig.cjs')],${
            env
              ? `\nenv: ${JSON.stringify(env, null, 2).replace(
                  /\n/gm,
                  '\n  '
                )},`
              : ''
          }${
            rules
              ? `\nrules: ${JSON.stringify(rules, null, 2).replace(
                  /\n/gm,
                  '\n  '
                )}`
              : ''
          }
        }
      `,
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

const { name } = require('../package.json')
const dedent = require('dedent-js')
const fs = require('../util/projectFs.cjs')
const JSON5 = require('json5')
const getPluginsArraySync = require('../util/getPluginsArraySync.cjs')

async function getRootEslintConfig() {
  if (await fs.pathExists('.eslintrc.json')) {
    return JSON5.parse(await fs.readFile('.eslintrc.json', 'utf8'))
  }
  if (await fs.pathExists('.eslintrc')) {
    return JSON5.parse(await fs.readFile('.eslintrc', 'utf8'))
  }
}

module.exports = [
  async function getConfigFiles() {
    const { env, rules } = (await getRootEslintConfig()) || {}
    const files = {
      '.eslintrc.cjs': (prev) =>
        prev
          ? prev.replace(
              new RegExp(
                `${name}/eslint.config.cjs`.replace(/\//g, '\\/'),
                'g'
              ),
              `${name}/eslintConfig.cjs`
            )
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
      'githooks.cjs',
      'lint-staged.config.cjs',
      'prettier.config.cjs',
    ]) {
      files[file] = dedent`
        /* eslint-env node, es2018 */
        const base = require('${name}/${file}')
        module.exports = {
          ...base,
        }
  
      `
    }
    const tasks = await getPluginsArraySync('vscodeTasks')
    const launch = await getPluginsArraySync('vscodeLaunch')

    if (tasks.length) {
      files['.vscode/tasks.json'] = JSON.stringify(
        {
          version: '2.0.0',
          tasks,
        },
        null,
        2
      )
    }
    if (launch.length) {
      files['.vscode/launch.json'] = JSON.stringify(
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

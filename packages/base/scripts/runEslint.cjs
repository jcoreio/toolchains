const fs = require('../util/projectFs.cjs')
const execa = require('../util/execa.cjs')
const getPluginsArraySync = require('../util/getPluginsArraySync.cjs')

async function eslintArgs() {
  return [
    ...((await fs.pathExists('.eslintignore')) ||
    !(await fs.pathExists('.gitignore'))
      ? []
      : (await fs.readFile('.gitignore', 'utf8'))
          .split(/\r\n?|\n/gm)
          .flatMap((pattern) =>
            !/^#/.test(pattern.trim())
              ? ['--ignore-pattern', pattern.trim()]
              : []
          )),
    '--ignore-pattern',
    'flow-typed/',
    '--ext',
    getPluginsArraySync('lintExtensions').join(','),
  ]
}

async function runEslint(args = []) {
  await execa('eslint', [...args, ...(await eslintArgs())], {
    env: {
      ...process.env,
      ESLINT_USE_FLAT_CONFIG: 'false',
    },
  })
}
exports.runEslint = runEslint

async function eslintCheck(args = []) {
  if (args.length === 0) args = ['.']
  await runEslint(args)
}
exports.eslintCheck = eslintCheck

async function eslintFix(args = []) {
  if (args.length === 0) args = ['.']
  await runEslint(['--fix', ...args])
}
exports.eslintFix = eslintFix

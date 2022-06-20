const fs = require('../util/projectFs.cjs')
const execa = require('../util/execa.cjs')
const getPluginsArraySync = require('../util/getPluginsArraySync.cjs')

async function eslintArgs() {
  return [
    ...((await fs.pathExists('.eslintignore'))
      ? ['--ignore-path', '.eslintignore']
      : (await fs.pathExists('.eslintignore'))
      ? ['--ignore-path', '.gitignore']
      : []),
    '--ignore-pattern',
    'flow-typed/',
    '--ext',
    ['.js', '.cjs', '.mjs', ...getPluginsArraySync('lintExtensions')].join(','),
  ]
}

async function runEslint(args = []) {
  await execa('eslint', [...args, ...(await eslintArgs())])
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

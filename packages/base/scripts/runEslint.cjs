const fs = require('../util/projectFs.cjs')
const execa = require('../util/execa.cjs')

async function eslintArgs() {
  return [
    '--ignore-path',
    (await fs.pathExists('.eslintignore')) ? '.eslintignore' : '.gitignore',
    '--ignore-pattern',
    'flow-typed/',
    '--ext',
    '.js,.cjs,.mjs',
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

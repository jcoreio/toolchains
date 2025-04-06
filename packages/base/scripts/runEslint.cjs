const execa = require('../util/execa.cjs')

async function runEslint(args = []) {
  await execa('eslint', [...args])
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

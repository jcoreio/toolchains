const fs = require('../util/projectFs.cjs')
const execa = require('../util/execa.cjs')

async function prettierArgs() {
  return [
    '--ignore-path',
    (await fs.pathExists('.prettierignore')) ? '.prettierignore' : '.gitignore',
  ]
}

async function runPrettier(args = []) {
  await execa('prettier', [...(await prettierArgs()), ...args])
}
exports.runPrettier = runPrettier

async function prettierCheck(args = []) {
  if (args.length === 0) args = ['.']
  await runPrettier(['-c', ...args])
}
exports.prettierCheck = prettierCheck

async function prettierFormat(args = []) {
  if (args.length === 0) args = ['.']
  await runPrettier(['--write', ...args])
}
exports.prettierFormat = prettierFormat

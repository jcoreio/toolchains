const fs = require('../util/projectFs.cjs')
const execa = require('../util/execa.cjs')

async function prettierArgs() {
  return (await fs.pathExists('.prettierignore'))
    ? ['--ignore-path', '.prettierignore']
    : (await fs.pathExists('.gitignore'))
      ? ['--ignore-path', '.gitignore']
      : []
}

async function runPrettier(args = []) {
  await execa('prettier', [...(await prettierArgs()), ...args])
}
exports.runPrettier = runPrettier

async function prettierCheck(args = []) {
  if (args.length === 0) args = ['.', '!pnpm-lock.yaml']
  await runPrettier(['-c', ...args])
}
exports.prettierCheck = prettierCheck

async function prettierFormat(args = []) {
  if (args.length === 0) args = ['.', '!pnpm-lock.yaml']
  await runPrettier(['--write', ...args])
}
exports.prettierFormat = prettierFormat

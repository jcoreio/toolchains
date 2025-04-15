const execa = require('../util/execa.cjs')

async function runPrettier(args = []) {
  await execa('prettier', [...args])
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

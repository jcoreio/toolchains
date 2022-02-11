const findUp = require('find-up')
const Path = require('path')
const fs = require('fs-extra')
const once = require('./once.cjs')
const { name } = require('../package.json')

const findGitDir = once(function findGitDir(
  cwd = process.env.INIT_CWD || process.cwd()
) {
  return findUp.sync('.git', { cwd, type: 'directory' })
})
exports.findGitDir = findGitDir

let cwd = process.env.INIT_CWD || process.cwd()

const nodeModulesMatch = /\/node_modules(\/|$)/.exec(cwd)
if (nodeModulesMatch) cwd = cwd.substring(0, nodeModulesMatch.index)

const packageJsonFile = findUp.sync('package.json', { cwd, type: 'file' })
if (!packageJsonFile) {
  throw new Error(
    `failed to find project package.json in a parent directory of ${cwd}`
  )
}
exports.packageJsonFile = packageJsonFile
const packageJson = (exports.packageJson = fs.readJsonSync(packageJsonFile))
exports.projectDir = Path.dirname(packageJsonFile)

exports.toolchainPackages = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
].filter((dep) => dep.startsWith(name))

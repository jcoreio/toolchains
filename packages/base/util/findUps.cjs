const findUp = require('find-up')
const Path = require('path')
const fs = require('fs-extra')
const merge = require('lodash/merge')
const once = require('./once.cjs')
const { name } = require('../package.json')
const configSchema = require('./configSchema.cjs')

const findGitDir = once(function findGitDir(
  cwd = process.env.INIT_CWD || process.cwd()
) {
  return findUp.sync('.git', { cwd, type: 'directory' })
})
exports.findGitDir = findGitDir

let cwd = process.cwd()

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
const projectDir = (exports.projectDir = Path.dirname(packageJsonFile))

const toolchainPackages = (exports.toolchainPackages = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
].filter((dep) => dep.startsWith(name)))

const toolchainPackageJsons = (exports.toolchainPackageJsons = {})
for (const pkg of toolchainPackages) {
  toolchainPackageJsons[pkg] = require(require.resolve(`${pkg}/package.json`, {
    paths: [projectDir],
  }))
}

let toolchainConfigFile
try {
  toolchainConfigFile = require.resolve(
    Path.join(exports.projectDir, 'toolchain.config.cjs')
  )
} catch (error) {
  // ignore
}

let toolchainConfig
try {
  toolchainConfig = configSchema.parse(
    toolchainConfigFile ? require(toolchainConfigFile) : packageJson[name] || {}
  )
} catch (error) {
  const toolchainConfigLocation = toolchainConfigFile
    ? Path.relative(cwd, toolchainConfigFile)
    : `packageJson[${JSON.stringify(name)}]`

  // eslint-disable-next-line no-console
  console.error(`invalid ${toolchainConfigLocation}`)
  // eslint-disable-next-line no-console
  console.error(error.message)
  process.exit(1)
}

exports.toolchainConfig = toolchainConfig

const toolchainManaged = (exports.toolchainManaged = {})
for (const toolchainPkgJson of Object.values(toolchainPackageJsons)) {
  const toolchainPkgDeps = toolchainPkgJson.dependencies || {}
  const toolchainPkgDevDeps = toolchainPkgJson.devDependencies || {}
  if (toolchainPkgJson.toolchainManaged) {
    for (const section in toolchainPkgJson.toolchainManaged) {
      if (!toolchainManaged[section]) toolchainManaged[section] = {}
      const sectionCfg = toolchainPkgJson.toolchainManaged[section]
      if (section.endsWith('ependencies')) {
        for (const dep in sectionCfg) {
          let version = sectionCfg[dep]
          if (version === '*')
            version = toolchainPkgDevDeps[dep] || toolchainPkgDeps[dep]
          if (version !== '*') toolchainManaged[section][dep] = version
        }
        continue
      }
      if (sectionCfg && typeof sectionCfg === 'object') {
        toolchainManaged[section] = merge(toolchainManaged[section], sectionCfg)
        continue
      }
      toolchainManaged[section] = sectionCfg
    }
  }
}

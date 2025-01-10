const findUp = require('find-up')
const Path = require('path')
const fs = require('fs-extra')
const { globSync } = require('glob')
const merge = require('./merge.cjs')
const once = require('./once.cjs')
const { name } = require('../package.json')
const configSchema = require('./configSchema.cjs')

const cwd = (
  fs.pathExistsSync(Path.join(process.cwd(), 'package.json'))
    ? process.cwd()
    : __filename
).replace(/\/node_modules(\/.*|$)/, '')

const packageJsonFile = (exports.packageJsonFile = findUp.sync('package.json', {
  cwd,
  type: 'file',
}))
if (!packageJsonFile) {
  throw new Error(
    `failed to find project package.json in a parent directory of ${cwd}`
  )
}
const packageJson = (exports.packageJson = fs.readJsonSync(packageJsonFile))
const projectDir = (exports.projectDir = Path.dirname(packageJsonFile))

const pnpmWorkspaceFile = (exports.pnpmWorkspaceFile = findUp.sync(
  'pnpm-workspace.yaml',
  {
    cwd,
    type: 'file',
  }
))
const pnpmWorkspace = pnpmWorkspaceFile
  ? require('yaml').parse(fs.readFileSync(pnpmWorkspaceFile, 'utf8'))
  : undefined

const isMonorepoSubpackage = (exports.isMonorepoSubpackage =
  pnpmWorkspace && Array.isArray(pnpmWorkspace.packages)
    ? pnpmWorkspace.packages.some((p) =>
        new RegExp(`^${p.replace(/\*/g, '[^/]+')}$`).test(
          Path.relative(Path.dirname(pnpmWorkspaceFile), projectDir)
        )
      )
    : false)

const isMonorepoRoot = (exports.isMonorepoRoot =
  pnpmWorkspaceFile != null && Path.dirname(pnpmWorkspaceFile) === projectDir)

const monorepoProjectDir = (exports.monorepoProjectDir =
  isMonorepoSubpackage || isMonorepoRoot
    ? Path.dirname(pnpmWorkspaceFile)
    : undefined)

const monorepoPackageJsonFile = (exports.monorepoPackageJsonFile =
  monorepoProjectDir
    ? Path.join(monorepoProjectDir, 'package.json')
    : undefined)
exports.monorepoPackageJson = monorepoPackageJsonFile
  ? fs.readJsonSync(monorepoPackageJsonFile)
  : undefined

exports.monorepoSubpackageJsonFiles = pnpmWorkspace
  ? [
      ...new Set(
        pnpmWorkspace.packages.flatMap((p) =>
          globSync(Path.join(p, 'package.json'), { cwd: monorepoProjectDir })
        )
      ),
    ].map((f) => Path.resolve(monorepoProjectDir, f))
  : undefined

exports.monorepoSubpackageJsons = exports.monorepoSubpackageJsonFiles
  ? exports.monorepoSubpackageJsonFiles.map((f) => fs.readJsonSync(f))
  : undefined

const findGitDir = once(function findGitDir(cwd = process.cwd()) {
  let stopAt = Path.dirname(monorepoProjectDir || projectDir)
  if (stopAt === '/') stopAt = undefined
  return findUp.sync((dir) => (dir === stopAt ? findUp.stop : '.git'), {
    cwd,
    type: 'directory',
  })
})
exports.findGitDir = findGitDir

const toolchainPackages = (exports.toolchainPackages = [
  packageJson.name,
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
].filter((dep) => dep.startsWith(name)))

const toolchainPackageJsons = (exports.toolchainPackageJsons = {})
for (const pkg of toolchainPackages) {
  toolchainPackageJsons[pkg] =
    pkg === packageJson.name
      ? packageJson
      : require(require.resolve(`${pkg}/package.json`, {
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

exports.toolchainConfigDeclared =
  toolchainConfigFile != null || name in packageJson

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
  const toolchainPkgPeerDeps = toolchainPkgJson.peerDependencies || {}
  if (toolchainPkgJson.toolchainManaged) {
    for (const section in toolchainPkgJson.toolchainManaged) {
      if (!toolchainManaged[section]) toolchainManaged[section] = {}
      const sectionCfg = toolchainPkgJson.toolchainManaged[section]
      if (section.endsWith('ependencies')) {
        for (const dep in sectionCfg) {
          let version = sectionCfg[dep]
          if (version === '*') {
            version =
              toolchainPkgDevDeps[dep] ||
              toolchainPkgDeps[dep] ||
              toolchainPkgPeerDeps[dep]
          }
          if (version && version !== '*') {
            toolchainManaged[section][dep] = version
          }
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

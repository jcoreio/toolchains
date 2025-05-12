const findUp = require('find-up')
const Path = require('path')
const fs = require('fs-extra')
const { globSync } = require('glob')
const merge = require('./merge.cjs')
const once = require('./once.cjs')
const { name } = require('../package.json')
const configSchema = require('./configSchema.cjs')
const debug = require('debug')('@jcoreio/toolchain:findUps')

// First see if the cwd is within a project dir
let dir = process
  .cwd()
  .replace(/\/node_modules(\/.*|$)|\\node_modules(\\.*|$)/, '')

function matchNamedPackageJson(directory) {
  try {
    const json = fs.readJsonSync(Path.join(directory, 'package.json'))
    if (json.name) return 'package.json'
  } catch {
    return undefined
  }
}

let packageJsonFile = findUp.sync(matchNamedPackageJson, {
  cwd: dir,
  type: 'file',
})
debug({ step: 0, cwd: process.cwd(), dir, packageJsonFile })

if (!packageJsonFile) {
  // When the cwd is not within a project dir, see if this file is within a project dir
  dir = __dirname.replace(/\/node_modules(\/.*|$)|\\node_modules(\\.*|$)/, '')

  packageJsonFile = findUp.sync(matchNamedPackageJson, {
    cwd: dir,
    type: 'file',
  })
}
debug({ step: 1, dir, packageJsonFile })

if (!packageJsonFile) {
  debug(`failed to find project package.json in a parent directory of ${dir}`)
  throw new Error(
    `failed to find project package.json in a parent directory of ${dir}`
  )
}

// When this file is within the @jcoreio/toolchains monorepo, the above will find
// packages/base/package.json, but we want to get the monorepo root package.json instead
// if @jcoreio/toolchains is operating on itself.   But if we're invoking the CLI from
// a working copy of the monorepo from a cwd outside of it, we want to error out
let packageJson = fs.readJsonSync(packageJsonFile)
debug({ step: 2, 'packageJson.name': packageJson.name })

if (!packageJsonFile) {
  debug(`failed to find project package.json in a parent directory of ${dir}`)
  throw new Error(
    `failed to find project package.json in a parent directory of ${dir}`
  )
}

if (packageJson.name === name) {
  packageJsonFile = findUp.sync(matchNamedPackageJson, {
    cwd: Path.dirname(Path.dirname(packageJsonFile)),
    type: 'file',
  })
  packageJson = packageJsonFile ? fs.readJsonSync(packageJsonFile) : undefined
  debug({
    step: 3,
    packageJsonFile,
    'packageJson.name': packageJson.name,
  })
  if (
    // When vscode-prettier is trying to format a file in this monorepo, the
    // cwd may be outside the monorepo, which would make our logic decide
    // no project is found...we work around this by setting this environment
    // variable in the tool configs.
    (!process.env.JCOREIO_TOOLCHAIN_SELF_TEST &&
      Path.relative(Path.dirname(packageJsonFile), process.cwd()).startsWith(
        '..'
      )) ||
    !packageJson ||
    packageJson.name !== '@jcoreio/toolchains'
  ) {
    debug(`failed to find project package.json in a parent directory of ${dir}`)
    throw new Error(
      `failed to find project package.json in a parent directory of ${dir}`
    )
  }
}
exports.packageJsonFile = packageJsonFile
exports.packageJson = packageJson
const projectDir = (exports.projectDir = Path.dirname(packageJsonFile))

const pnpmWorkspaceFile = (exports.pnpmWorkspaceFile = findUp.sync(
  'pnpm-workspace.yaml',
  {
    dir,
    type: 'file',
  }
))
const pnpmWorkspace =
  pnpmWorkspaceFile ?
    require('yaml').parse(fs.readFileSync(pnpmWorkspaceFile, 'utf8'))
  : undefined

const isMonorepoSubpackage = (exports.isMonorepoSubpackage =
  pnpmWorkspace && Array.isArray(pnpmWorkspace.packages) ?
    pnpmWorkspace.packages.some((p) =>
      new RegExp(`^${p.replace(/\*/g, '[^/]+')}$`).test(
        Path.relative(Path.dirname(pnpmWorkspaceFile), projectDir)
      )
    )
  : false)

const isMonorepoRoot = (exports.isMonorepoRoot =
  pnpmWorkspaceFile != null && Path.dirname(pnpmWorkspaceFile) === projectDir)

const monorepoProjectDir = (exports.monorepoProjectDir =
  isMonorepoSubpackage || isMonorepoRoot ?
    Path.dirname(pnpmWorkspaceFile)
  : undefined)

const monorepoPackageJsonFile = (exports.monorepoPackageJsonFile =
  monorepoProjectDir ?
    Path.join(monorepoProjectDir, 'package.json')
  : undefined)
exports.monorepoPackageJson =
  monorepoPackageJsonFile ? fs.readJsonSync(monorepoPackageJsonFile) : undefined

exports.monorepoSubpackageJsonFiles =
  pnpmWorkspace ?
    [
      ...new Set(
        pnpmWorkspace.packages.flatMap((p) =>
          globSync(Path.join(p, 'package.json'), { cwd: monorepoProjectDir })
        )
      ),
    ].map((f) => Path.resolve(monorepoProjectDir, f))
  : undefined

exports.monorepoSubpackageDirs =
  exports.monorepoSubpackageJsonFiles ?
    exports.monorepoSubpackageJsonFiles.map((f) => Path.dirname(f))
  : undefined

exports.monorepoSubpackageJsons =
  exports.monorepoSubpackageJsonFiles ?
    exports.monorepoSubpackageJsonFiles.map((f) => fs.readJsonSync(f))
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
  name,
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
].filter((dep) => dep.startsWith(name)))

const isToolchainDev = Path.normalize(__dirname)
  .replace(/\\/, '/')
  .endsWith('packages/base/util')

const toolchainPackageJsons = (exports.toolchainPackageJsons = {})
for (const pkg of toolchainPackages) {
  toolchainPackageJsons[pkg] =
    pkg === packageJson.name ?
      packageJson
    : require(
        isToolchainDev ?
          Path.resolve(
            __dirname,
            '..',
            '..',
            pkg === '@jcoreio/toolchain' ? 'base' : (
              pkg.replace('@jcoreio/toolchain-', '')
            ),
            'package.json'
          )
        : require.resolve(`${pkg}/package.json`, {
            paths: [projectDir],
          })
      )
}

let toolchainConfigFile
try {
  toolchainConfigFile = require.resolve(
    Path.join(exports.projectDir, 'toolchain.config.cjs')
  )
  // eslint-disable-next-line no-unused-vars
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
  const toolchainConfigLocation =
    toolchainConfigFile ?
      Path.relative(process.cwd(), toolchainConfigFile)
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

debug(exports)

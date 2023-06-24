const { name } = require('../../package.json')
const { projectDir, toolchainPackages } = require('../../util/findUps.cjs')
const getPluginsAsyncFunction = require('../../util/getPluginsAsyncFunction.cjs')
const fs = require('../../util/projectFs.cjs')
const sortDeps = require('../../util/sortDeps.cjs')
const semver = require('semver')

async function bootstrapProjectPackageJson() {
  const { merge, unset } = require('lodash')

  const packageJson = await fs.readJson('package.json')
  const devDependencies =
    packageJson.devDependencies || (packageJson.devDependencies = {})

  const toolchainManaged = {}
  for (const pkg of toolchainPackages) {
    const toolchainPkgJson = require(require.resolve(`${pkg}/package.json`, {
      paths: [projectDir],
    }))
    const toolchainPkgDeps = toolchainPkgJson.dependencies || {}
    const toolchainPkgDevDeps = toolchainPkgJson.devDependencies || {}
    if (toolchainPkgJson.toolchainManaged) {
      for (const section in toolchainPkgJson.toolchainManaged) {
        const sectionDeps = toolchainPkgJson.toolchainManaged[section]
        if (!toolchainManaged[section]) toolchainManaged[section] = {}
        for (const dep in sectionDeps) {
          let version = sectionDeps[dep]
          if (version === '*')
            version = toolchainPkgDevDeps[dep] || toolchainPkgDeps[dep]
          if (version !== '*') toolchainManaged[section][dep] = version
        }
      }
    }
  }

  for (const path of [
    'exports',
    'eslintConfig',
    'files',
    'husky',
    'main',
    'module',
    'renovate',
    'prettier',
    'commitlint',
    'lint-staged',
    'nyc',
    'husky',
    'config.mocha',
  ]) {
    unset(packageJson, path)
  }
  for (const dep of require('./bootstrapRemoveDevDeps.cjs')) {
    delete devDependencies[dep]
  }

  merge(packageJson, {
    version: '0.0.0-development',
    sideEffects: false,
    scripts: {
      tc: 'toolchain',
      toolchain: 'toolchain',
      test: 'toolchain test',
      prepublishOnly:
        'echo This package is meant to be published by semantic-release from the dist build directory. && exit 1',
    },
    config: {
      commitizen: { path: `${name}/commitizen.cjs` },
    },
  })

  for (const section in toolchainManaged) {
    const managedSection = toolchainManaged[section]
    const pkgSectionName = section.replace(/^optionalD/, 'd')
    let pkgSection = packageJson[pkgSectionName]
    if (!pkgSection) {
      if (/^optional/.test(section)) continue
      pkgSection = packageJson[pkgSectionName] = {}
    }
    for (const dep in managedSection) {
      if (/^optional/.test(section) && !pkgSection[dep]) continue
      const versionRange = managedSection[dep]
      if (
        !pkgSection[dep] ||
        semver.gt(
          versionRange.replace(/^\D+/, ''),
          pkgSection[dep].replace(/^\D+/, '')
        )
      ) {
        pkgSection[dep] = versionRange
      }
    }
  }

  await getPluginsAsyncFunction('bootstrapProjectPackageJson')(packageJson)

  sortDeps(packageJson)

  await fs.writeJson('package.json', packageJson, { spaces: 2 })
  // eslint-disable-next-line no-console
  console.error('updated package.json')
}

module.exports = bootstrapProjectPackageJson

const { toolchainManaged } = require('../../util/findUps.cjs')
const getPluginsAsyncFunction = require('../../util/getPluginsAsyncFunction.cjs')
const fs = require('../../util/projectFs.cjs')
const sortDeps = require('../../util/sortDeps.cjs')
const semver = require('semver')
const isEmpty = require('lodash/isEmpty')

async function bootstrapProjectPackageJson() {
  const { merge, unset } = require('lodash')

  const packageJson = await fs.readJson('package.json')
  const devDependencies =
    packageJson.devDependencies || (packageJson.devDependencies = {})

  for (const path of [
    'commitlint',
    'config.commitizen',
    'config.eslint',
    'config.lint',
    'config.mocha',
    'config.prettier',
    'eslintConfig',
    'exports',
    'files',
    'husky',
    'husky',
    'lint-staged',
    'main',
    'module',
    'nyc',
    'prettier',
    'renovate',
    'scripts.build:cjs',
    'scripts.build:js',
    'scripts.build:mjs',
    'scripts.build:types',
    'scripts.build',
    'scripts.clean',
    'scripts.codecov',
    'scripts.coverage',
    'scripts.commitmsg',
    'scripts.flow:coverage',
    'scripts.flow:watch',
    'scripts.flow',
    'scripts.lint:fix',
    'scripts.lint:watch',
    'scripts.lint',
    'scripts.open:coverage',
    'scripts.precommit',
    'scripts.prepublishOnly',
    'scripts.prepush',
    'scripts.prettier:check',
    'scripts.prettier',
    'scripts.semantic-release',
    'scripts.test:debug',
    'scripts.test:watch',
    'scripts.test',
    'scripts.travis-deploy-once',
    'scripts.tsc:wath',
    'scripts.tsc',
  ]) {
    unset(packageJson, path)
  }
  for (const dep of require('./bootstrapRemoveDevDeps.cjs')) {
    delete devDependencies[dep]
  }

  merge(
    packageJson,
    {
      version: '0.0.0-development',
      sideEffects: false,
      packageManager: 'pnpm@^8.6.6',
      scripts: {
        tc: 'toolchain',
        toolchain: 'toolchain',
        test: 'toolchain test',
        prepublishOnly:
          'echo This package is meant to be published by semantic-release from the dist build directory. && exit 1',
      },
    },
    toolchainManaged.engines,
    packageJson.engines
  )
  if (isEmpty(packageJson.config)) delete packageJson.config

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

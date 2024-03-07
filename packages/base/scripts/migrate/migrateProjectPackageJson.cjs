const { toolchainManaged } = require('../../util/findUps.cjs')
const { name } = require('../../package.json')
const getPluginsAsyncFunction = require('../../util/getPluginsAsyncFunction.cjs')
const fs = require('../../util/projectFs.cjs')
const sortDeps = require('../../util/sortDeps.cjs')
const semver = require('semver')
const isEmpty = require('lodash/isEmpty')
const pick = require('lodash/pick')
const Path = require('path')
const confirmOutputEsm = require('./confirmOutputEsm.cjs')
const confirm = require('../../util/confirm.cjs')

async function migrateProjectPackageJson() {
  const { merge, unset } = require('lodash')

  const packageJson = await fs.readJson('package.json')
  const devDependencies =
    packageJson.devDependencies || (packageJson.devDependencies = {})

  await getPluginsAsyncFunction('migrateProjectPackageJson')(packageJson)

  for (const path of [
    'commitlint',
    'config.commitizen',
    'config.eslint',
    'config.lint',
    'config.mocha',
    'config.prettier',
    'eslintConfig',
    'files',
    'husky',
    'husky',
    'lint-staged',
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
  if (!packageJson.main && !packageJson.exports && !packageJson.module) {
    const hasIndexTypes =
      (await fs.pathExists(Path.join('src', 'index.ts'))) ||
      (await fs.pathExists(Path.join('src', 'index.tsx'))) ||
      (await fs.pathExists(Path.join('src', 'index.d.ts')))
    const hasIndex =
      hasIndexTypes || (await fs.pathExists(Path.join('src', 'index.js')))
    if (hasIndex) {
      packageJson.main = 'dist/index.js'
      packageJson.module = 'dist/index.mjs'
    }
    if (hasIndexTypes) {
      packageJson.types = 'dist/index.d.ts'
    }
  }
  for (const dep of require('./migrateRemoveDevDeps.cjs')) {
    delete devDependencies[dep]
  }

  if (!packageJson.exports && packageJson.main) {
    const relativize = (p) => (p.startsWith('.') ? p : `./${p}`)

    const dotStar = await confirm({
      type: 'confirm',
      initial: true,
      ifNotInteractive: false,
      message: 'Add ./* exports map to package.json?',
    })
    const outputEsm = await confirmOutputEsm()
    packageJson.exports = {
      './package.json': './package.json',
      '.': {
        ...(packageJson.types ? { types: relativize(packageJson.types) } : {}),
        ...(outputEsm !== false && packageJson.module
          ? { import: relativize(packageJson.module) }
          : {}),
        default: relativize(packageJson.main),
      },
      ...(dotStar
        ? {
            './*': {
              types: './*.d.ts',
              ...(outputEsm !== false ? { import: './*.mjs' } : {}),
              default: './*.js',
            },
          }
        : {}),
    }
  }

  merge(
    packageJson,
    {
      version: '0.0.0-development',
      sideEffects: false,
      scripts: {
        tc: 'toolchain',
        toolchain: 'toolchain',
        test: 'toolchain test',
        prepublishOnly:
          'echo This package is meant to be published by semantic-release from the dist build directory. && exit 1',
      },
    },
    pick(toolchainManaged, 'engines', 'packageManager'),
    pick(packageJson, 'engines')
  )
  if (isEmpty(packageJson.config)) delete packageJson.config

  const isTest = Boolean(process.env.JCOREIO_TOOLCHAIN_TEST)

  for (const section in toolchainManaged) {
    if (!section.endsWith('ependencies')) continue
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
      if (isTest && dep.startsWith(`${name}-`)) {
        pkgSection[dep] = `link:${dep.replace(`${name}-`, '../packages/')}`
      } else if (
        !pkgSection[dep] ||
        !semver.satisfies(semver.minVersion(pkgSection[dep]), versionRange)
      ) {
        pkgSection[dep] = versionRange
      }
    }
  }

  sortDeps(packageJson)

  await fs.writeJson('package.json', packageJson, { spaces: 2 })
  // eslint-disable-next-line no-console
  console.error('updated package.json')
}

module.exports = migrateProjectPackageJson

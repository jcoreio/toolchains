const { name, peerDependencies: basePeerDeps } = require('../../package.json')
const { projectDir, toolchainPackages } = require('../../util/findUps.cjs')
const getPluginsAsyncFunction = require('../../util/getPluginsAsyncFunction.cjs')
const fs = require('../../util/projectFs.cjs')
const sortDeps = require('../../util/sortDeps.cjs')

async function bootstrapProjectPackageJson() {
  const { merge, unset } = require('lodash')

  const packageJson = await fs.readJson('package.json')
  const devDependencies =
    packageJson.devDependencies || (packageJson.devDependencies = {})

  const peerDependencies = { ...basePeerDeps }
  for (const pkg of toolchainPackages) {
    Object.assign(
      peerDependencies,
      require(require.resolve(`${pkg}/package.json`, { paths: [projectDir] }))
        .peerDependencies
    )
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

  if (peerDependencies) {
    for (const dep in peerDependencies) {
      const version = peerDependencies[dep]
      if (version.startsWith('workspace') || version === '*') continue
      packageJson.devDependencies[dep] = version
    }
  }

  await getPluginsAsyncFunction('bootstrapProjectPackageJson')(packageJson)

  sortDeps(packageJson)

  await fs.writeJson('package.json', packageJson, { spaces: 2 })
  // eslint-disable-next-line no-console
  console.error('updated package.json')
}

module.exports = bootstrapProjectPackageJson

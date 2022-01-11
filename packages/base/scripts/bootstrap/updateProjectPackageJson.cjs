const { name, dependencies: ownDeps } = require('../../package.json')
const fs = require('../../util/projectFs.cjs')

async function updateProjectPackageJson({ hard = false } = {}) {
  const { merge, unset, pick } = require('lodash')

  const packageJson = await fs.readJson('package.json')
  const { devDependencies } = packageJson

  if (hard) {
    for (const path of [
      'exports',
      'files',
      'husky',
      'main',
      'module',
      'renovate',
      'prettier',
      'eslintConfig',
      'commitlint',
      'lint-staged',
      'nyc',
      'husky',
      'config.mocha',
    ]) {
      unset(packageJson, path)
    }
  }
  if (devDependencies && hard) {
    for (const dep of require('./removeDevDeps.cjs')) {
      delete devDependencies[dep]
    }
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
    devDependencies: pick(ownDeps, 'mocha', 'chai'),
    config: {
      commitizen: { path: `${name}/commitizen.cjs` },
    },
  })

  await fs.writeJson('package.json', packageJson, { spaces: 2 })
  // eslint-disable-next-line no-console
  console.error('updated package.json')
}

module.exports = updateProjectPackageJson

const fs = require('../../util/projectFs.cjs')

async function preinstallUpdateProjectPackageJson() {
  const { unset } = require('lodash')

  const packageJson = await fs.readJson('package.json')
  const { devDependencies } = packageJson

  for (const path of [
    'exports',
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
  if (devDependencies) {
    for (const dep in Object.keys(devDependencies)) {
      if (dep.startsWith('@babel/')) delete devDependencies[dep]
    }
    for (const dep of require('./preinstallRemoveDevDeps.cjs')) {
      delete devDependencies[dep]
    }
  }

  await fs.writeJson('package.json', packageJson, { spaces: 2 })
  // eslint-disable-next-line no-console
  console.error('updated package.json')
}

module.exports = preinstallUpdateProjectPackageJson

const { name, dependencies: ownDeps } = require('../../package.json')
const fs = require('../../util/projectFs.cjs')
const sortDeps = require('../../util/sortDeps.cjs')

async function updateProjectPackageJson() {
  const { merge, pick } = require('lodash')

  const packageJson = await fs.readJson('package.json')

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

  sortDeps(packageJson)

  await fs.writeJson('package.json', packageJson, { spaces: 2 })
  // eslint-disable-next-line no-console
  console.error('updated package.json')
}

module.exports = updateProjectPackageJson

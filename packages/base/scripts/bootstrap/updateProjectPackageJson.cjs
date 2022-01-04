const { name, dependencies: ownDeps } = require('../../package.json')
const fs = require('../../util/projectFs.cjs')

async function updateProjectPackageJson() {
  const packageJson = await fs.readJson('package.json')
  const devDependencies =
    packageJson.devDependencies || (packageJson.devDependencies = {})
  for (const dep of ['mocha', 'chai']) {
    devDependencies[dep] = ownDeps[dep]
  }
  const config = packageJson.config || (packageJson.config = {})
  if (!config.commitizen) {
    config.commitizen = {
      path: `${name}/commitizen.cjs`,
    }
  }
  const scripts = packageJson.scripts || (packageJson.scripts = {})
  scripts.toolchain = 'toolchain'
  scripts.tc = 'tc'
  await fs.writeJson('package.json', packageJson, { spaces: 2 })
  // eslint-disable-next-line no-console
  console.error('updated package.json')
}

module.exports = updateProjectPackageJson

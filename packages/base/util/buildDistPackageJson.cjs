const fs = require('../util/projectFs.cjs')

module.exports = async function buildDistPackageJson() {
  const packageJson = await fs.readJson('package.json')
  delete packageJson.devDependencies
  // eslint-disable-next-line no-console
  console.error('package.json -> dist/package.json')
  await fs.writeJson('dist/package.json', packageJson, { spaces: 2 })
}

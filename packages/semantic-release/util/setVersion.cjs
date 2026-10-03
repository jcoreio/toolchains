const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const path = require('path')

module.exports = async function setVersion({ packageJsonFile, version }) {
  const packageJson = await fs.readJson(packageJsonFile)
  packageJson.version = version
  await fs.writeJson(packageJsonFile, packageJson, { spaces: 2 })
  // eslint-disable-next-line no-console
  console.error(
    `wrote "version": ${JSON.stringify(version)} to ${path.relative(process.cwd(), packageJsonFile)}`
  )
}

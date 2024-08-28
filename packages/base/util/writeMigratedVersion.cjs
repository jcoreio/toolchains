const fs = require('../util/projectFs.cjs')
const { name, version: currentVersion } = require('../package.json')

module.exports = async function writeMigratedVersion() {
  const packageJson = await fs.readJson('package.json')
  if (packageJson[name] && packageJson[name].migratedVersion === currentVersion)
    return
  await fs.writeJson(
    'package.json',
    {
      ...packageJson,
      [name]: {
        ...packageJson[name],
        migratedVersion: currentVersion,
      },
    },
    { spaces: 2 }
  )
}

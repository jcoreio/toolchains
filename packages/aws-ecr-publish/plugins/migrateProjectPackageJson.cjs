module.exports = [
  async function migrateProjectPackageJson(packageJson, { fromVersion }) {
    if (fromVersion) return
    packageJson.type = 'module'
    ;(packageJson.engines || (packageJson.engines = {})).node = '>=24'
  },
]

const mapValues = require('../util/mapValues.cjs')

module.exports = [
  async function buildDistPackageJson(packageJson) {
    delete packageJson.devDependencies
    delete packageJson.scripts
    delete packageJson.config

    function replaceDist(path) {
      return path.replace(/^(\.\/)?dist\//, '$1')
    }

    for (const key of ['main', 'module', 'browser', 'types', 'bin']) {
      if (typeof packageJson[key] === 'string') {
        packageJson[key] = replaceDist(packageJson[key])
      }
    }
    for (const key of ['bin', 'directories']) {
      if (typeof packageJson[key] === 'object' && packageJson[key] != null) {
        packageJson[key] = mapValues(packageJson[key], replaceDist)
      }
    }

    if (Array.isArray(packageJson.files)) {
      packageJson.files = packageJson.files.map(replaceDist)
    }

    function convertExportMap(thing) {
      if (typeof thing === 'string') return replaceDist(thing)
      if (typeof thing === 'object' && thing != null)
        return mapValues(thing, convertExportMap)
      return thing
    }
    if (packageJson.exports)
      packageJson.exports = convertExportMap(packageJson.exports)
    if (packageJson.imports)
      packageJson.imports = convertExportMap(packageJson.imports)

    return packageJson
  },
]

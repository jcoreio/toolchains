const mapValues = require('../util/mapValues.cjs')
const { toolchainConfig } = require('@jcoreio/toolchain/util/findUps.cjs')
const { outputEsm } = toolchainConfig

module.exports = [
  async function buildDistPackageJson(packageJson) {
    delete packageJson.devDependencies
    delete packageJson.scripts
    delete packageJson.config

    function replaceDist(path, ext) {
      path = path.replace(/^(\.\/)?(src|dist)\//, '$1')
      if (ext) path = path.replace(/\.tsx?$/, ext)
      return path
    }

    for (const key of ['main', 'module', 'browser', 'types', 'bin']) {
      if (typeof packageJson[key] === 'string') {
        packageJson[key] = replaceDist(
          packageJson[key],
          key === 'module' ? '.mjs'
          : key === 'types' ? undefined
          : outputEsm ? '.mjs'
          : '.js'
        )
      }
    }
    for (const key of ['bin']) {
      if (typeof packageJson[key] === 'object' && packageJson[key] != null) {
        packageJson[key] = mapValues(packageJson[key], (path) =>
          replaceDist(path, outputEsm ? '.mjs' : '.js')
        )
      }
    }

    for (const key of ['directories']) {
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

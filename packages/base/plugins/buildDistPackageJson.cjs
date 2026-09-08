const mapValues = require('../util/mapValues.cjs')
const { toolchainConfig } = require('@jcoreio/toolchain/util/findUps.cjs')
const outputEsm = toolchainConfig.outputEsm !== false

module.exports = [
  async function buildDistPackageJson(packageJson) {
    delete packageJson.devDependencies
    delete packageJson.scripts
    delete packageJson.config

    function replaceDist(path, ext) {
      path = path.replace(/^(\.\/)?(src|dist)\//, '$1')
      if (ext) path = path.replace(/(\.d)?\.tsx?$/, ext)
      return path
    }

    const isDual =
      toolchainConfig.outputCjs !== false && toolchainConfig.outputEsm !== false
    const dtsExtension =
      isDual && packageJson.type === 'module' ? '.d.cts' : '.d.ts'
    const cjsExtension =
      isDual && packageJson.type === 'module' ? '.cjs' : '.js'
    const esmExtension =
      isDual && packageJson.type !== 'module' ? '.mjs' : '.js'

    for (const key of ['main', 'module', 'browser', 'types', 'bin', 'types']) {
      if (typeof packageJson[key] === 'string') {
        packageJson[key] = replaceDist(
          packageJson[key],
          isDual ?
            key === 'module' ? esmExtension
            : key === 'main' ? cjsExtension
            : key === 'types' ? dtsExtension
            : outputEsm ? esmExtension
            : cjsExtension
          : key === 'types' ? '.d.ts'
          : '.js'
        )
      }
    }
    for (const key of ['bin']) {
      if (typeof packageJson[key] === 'object' && packageJson[key] != null) {
        packageJson[key] = mapValues(packageJson[key], (path) =>
          replaceDist(path, outputEsm ? esmExtension : cjsExtension)
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

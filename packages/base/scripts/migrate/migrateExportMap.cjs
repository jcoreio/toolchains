const semver = require('semver')

function migrateExportMap(
  exportMap,
  { fromVersion = '0.0.0', outputEsm = true } = {}
) {
  if (
    (semver.lt(fromVersion || '0.0.0', '5.5.0') && exportMap,
    outputEsm !== false)
  ) {
    function process(obj) {
      if (typeof obj.types === 'string') {
        obj.types = {
          import: obj.types.replace(/\.d\.ts$/, '.d.mts'),
          default: obj.types,
        }
      }
      for (const key in obj) {
        if (
          key !== 'types' &&
          Object.hasOwnProperty.call(obj, key) &&
          obj[key] != null &&
          typeof obj[key] === 'object'
        ) {
          process(obj[key])
        }
      }
    }
    if (exportMap != null && typeof exportMap === 'object') {
      process(exportMap)
    }
  }
  return exportMap
}

module.exports = migrateExportMap

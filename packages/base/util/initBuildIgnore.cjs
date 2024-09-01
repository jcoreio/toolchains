const { globExists } = require('@jcoreio/toolchain/util/glob.cjs')
const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')

module.exports = async function initBuildIgnore() {
  const buildIgnore = []
  if (await globExists('src/**/__tests__')) {
    buildIgnore.push('src/**/__tests__')
  }
  for (const extension of getPluginsArraySync('sourceExtensions')) {
    for (const suffix of ['test', 'spec']) {
      const pattern = `src/**/*.${suffix}.${extension}`
      if (await globExists(pattern, { ignore: 'src/**/__tests__/**' })) {
        buildIgnore.push(pattern)
      }
    }
  }
  return buildIgnore
}

const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')

module.exports = [
  () => [`test/**.{${getPluginsArraySync('sourceExtensions').join(',')}}`],
]

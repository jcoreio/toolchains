const getPluginsArraySync = require('../util/getPluginsArraySync.cjs')

module.exports = [
  () => [`test/**.{${getPluginsArraySync('sourceExtensions').join(',')}}`],
]

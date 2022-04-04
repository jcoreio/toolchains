const getPluginsArraySync = require('../base/util/getPluginsArraySync.cjs')

module.exports = function (api) {
  return {
    presets: getPluginsArraySync('babelPresets', api),
    plugins: getPluginsArraySync('babelPlugins', api),
  }
}

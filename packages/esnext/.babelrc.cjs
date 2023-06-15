const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')

module.exports = function (api) {
  return {
    presets: getPluginsArraySync('babelPresets', api),
    plugins: getPluginsArraySync('babelPlugins', api),
  }
}

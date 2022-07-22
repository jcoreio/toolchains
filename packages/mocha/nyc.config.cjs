const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')

module.exports = {
  include: ['src/**'],
  extension: getPluginsArraySync('sourceExtensions').map((ext) => '.' + ext),
  reporter: ['lcov', 'text'],
  sourceMap: true,
  instrument: true,
}

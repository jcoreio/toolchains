const getPluginsArraySync = require('./util/getPluginsArraySync.cjs')

module.exports = {
  include: ['src/**'],
  extension: ['.js', '.cjs', '.mjs', ...getPluginsArraySync('nycExtensions')],
  reporter: ['lcov', 'text'],
  sourceMap: true,
  instrument: true,
}

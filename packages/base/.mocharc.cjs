const getPluginsArraySync = require('./util/getPluginsArraySync.cjs')

module.exports = {
  require: [require.resolve('./util/configureMocha.cjs')],
  reporter: 'spec',
  spec: [
    require.resolve('./util/mochaWatchClearConsole.cjs'),
    ...getPluginsArraySync('mochaSpecs'),
  ],
}
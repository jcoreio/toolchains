const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')
const extensions = getPluginsArraySync('sourceExtensions')
const cliSpecs = require('./cliSpecs.cjs')

module.exports = {
  require: [require.resolve('./util/configureMocha.cjs')],
  reporter: 'spec',
  spec: [
    require.resolve('./util/mochaWatchClearConsole.cjs'),
    ...(cliSpecs.length ? cliSpecs : getPluginsArraySync('mochaSpecs')),
  ],
}

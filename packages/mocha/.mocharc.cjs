const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')
const extensions = getPluginsArraySync('sourceExtensions')
const path = require('path')

const files = process.argv.slice(2).filter((f) => {
  const ext = path.extname(f)
  return ext && extensions.includes(ext.substring(1))
})

module.exports = {
  require: [require.resolve('./util/configureMocha.cjs')],
  reporter: 'spec',
  spec: [
    require.resolve('./util/mochaWatchClearConsole.cjs'),
    ...(files.length ? files : getPluginsArraySync('mochaSpecs')),
  ],
}

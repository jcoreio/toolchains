const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')

module.exports = [
  () => {
    require('@babel/register')({
      extensions: getPluginsArraySync('sourceExtensions').map(
        (ext) => '.' + ext
      ),
    })
  },
]

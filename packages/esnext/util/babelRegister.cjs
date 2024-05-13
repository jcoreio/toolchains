const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')

require('@babel/register')({
  extensions: getPluginsArraySync('sourceExtensions').map((ext) => '.' + ext),
})

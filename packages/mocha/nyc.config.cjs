const { toolchainPackages } = require('@jcoreio/toolchain/util/findUps.cjs')
const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')

module.exports = {
  include: ['src/**'],
  extension: getPluginsArraySync('sourceExtensions').map((ext) => '.' + ext),
  reporter: ['lcov', 'text'],
  sourceMap: !toolchainPackages.includes('@jcoreio/toolchain-esnext'),
  instrument: !toolchainPackages.includes('@jcoreio/toolchain-esnext'),
}

const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')
const extensions = getPluginsArraySync('sourceExtensions')
const getSpecs = require('./getSpecs.cjs')
const { toolchainPackages } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = {
  require: [require.resolve('./util/configureMocha.cjs')],
  reporter: 'spec',
  recursive: true,
  spec: getSpecs(getPluginsArraySync('mochaSpecs')),
  watchIgnore: ['**/node_modules', '**/.git'],
  ...(toolchainPackages.includes('@jcoreio/toolchain-esnext') ?
    { 'node-option': [`import=@jcoreio/toolchain-esnext/util/esmLoader.cjs`] }
  : {}),
  ...(process.env.CI ? { forbidOnly: true } : {}),
  extension: extensions,
}

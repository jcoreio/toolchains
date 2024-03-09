const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')
const extensions = getPluginsArraySync('sourceExtensions')
const getSpecs = require('./getSpecs.cjs')

module.exports = {
  require: [require.resolve('./util/configureMocha.cjs')],
  reporter: 'spec',
  spec: getSpecs(getPluginsArraySync('mochaSpecs')),
  ...(process.env.JCOREIO_TOOLCHAIN_ESM
    ? {
        'node-option': [
          'experimental-default-type=module',
          `import=@jcoreio/toolchain-esnext/util/esmLoader.cjs`,
        ],
      }
    : {}),
}

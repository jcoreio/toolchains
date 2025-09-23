const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')
const extensions = getPluginsArraySync('sourceExtensions')
const getSpecs = require('./getSpecs.cjs')
const semver = require('semver')

module.exports = {
  require: [require.resolve('./util/configureMocha.cjs')],
  reporter: 'spec',
  recursive: true,
  spec: getSpecs(getPluginsArraySync('mochaSpecs')),
  watchIgnore: ['**/node_modules', '**/.git'],
  ...(process.env.JCOREIO_TOOLCHAIN_ESM ?
    {
      'node-option': [
        ...(semver.lt(process.version, '23.0.0') ?
          ['experimental-default-type=module']
        : []),
        `import=@jcoreio/toolchain-esnext/util/esmLoader.cjs`,
      ],
    }
  : {}),
  ...(process.env.CI ? { forbidOnly: true } : {}),
  extension: extensions,
}

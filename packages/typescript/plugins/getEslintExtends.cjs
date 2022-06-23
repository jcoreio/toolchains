const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')

module.exports = hasTSSourcesSync()
  ? [() => [require.resolve('../eslint.extends.cjs')]]
  : []

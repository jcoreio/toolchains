const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')

module.exports = hasTSSourcesSync()
  ? [[() => ['.ts', '.tsx'], { insteadOf: '@jcoreio/toolchain' }]]
  : []

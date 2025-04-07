const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')

module.exports =
  hasTSSourcesSync() ?
    [
      [
        () => ['ts', 'tsx', 'cts', 'ctsx', 'mts', 'mtsx'],
        { insteadOf: '@jcoreio/toolchain' },
      ],
    ]
  : []

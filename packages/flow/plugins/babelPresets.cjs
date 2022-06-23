const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')

module.exports = hasTSSourcesSync()
  ? []
  : [
      [
        () => [require.resolve('@babel/preset-flow')],
        { after: '@jcoreio/toolchain-esnext' },
      ],
    ]

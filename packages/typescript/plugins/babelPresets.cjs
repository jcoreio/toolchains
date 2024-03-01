const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')

module.exports = hasTSSourcesSync()
  ? [
      [
        () => [
          [
            require.resolve('@babel/preset-typescript'),
            { allowDeclareFields: true },
          ],
        ],
        { after: '@jcoreio/toolchain-esnext' },
      ],
    ]
  : []

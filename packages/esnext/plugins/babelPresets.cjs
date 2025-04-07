const { toolchainConfig } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  (api) => {
    const { JCOREIO_TOOLCHAIN_ESM } = process.env
    api.cache.using(() => JCOREIO_TOOLCHAIN_ESM)
    return [
      [
        require.resolve('@babel/preset-env'),
        {
          ...(JCOREIO_TOOLCHAIN_ESM ?
            toolchainConfig.esmBabelEnv || {
              targets: {
                node: 16,
              },
            }
          : toolchainConfig.cjsBabelEnv || { forceAllTransforms: true }),
          modules: JCOREIO_TOOLCHAIN_ESM ? false : 'auto',
        },
      ],
    ]
  },
]

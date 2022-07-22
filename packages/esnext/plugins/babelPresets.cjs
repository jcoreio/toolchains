const { toolchainConfig } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  (api) => {
    const { JCOREIO_TOOLCHAIN_MJS } = process.env
    api.cache.using(() => JCOREIO_TOOLCHAIN_MJS)
    return [
      [
        require.resolve('@babel/preset-env'),
        {
          ...(JCOREIO_TOOLCHAIN_MJS
            ? toolchainConfig.mjsBabelEnv || {
                targets: {
                  node: 16,
                },
              }
            : toolchainConfig.cjsBabelEnv || { forceAllTransforms: true }),
          modules: JCOREIO_TOOLCHAIN_MJS ? false : 'auto',
        },
      ],
    ]
  },
]

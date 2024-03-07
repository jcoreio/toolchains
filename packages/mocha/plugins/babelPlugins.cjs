module.exports = [
  [
    (api) => {
      const { JCOREIO_TOOLCHAIN_COVERAGE } = process.env
      api.cache.using(() => JCOREIO_TOOLCHAIN_COVERAGE)
      return [
        JCOREIO_TOOLCHAIN_COVERAGE && require.resolve('babel-plugin-istanbul'),
      ].filter(Boolean)
    },
    {
      after: [
        '@jcoreio/toolchain-esnext',
        '@jcoreio/toolchain-flow',
        '@jcoreio/toolchain-typescript',
        '@jcoreio/toolchain-react',
      ],
    },
  ],
]

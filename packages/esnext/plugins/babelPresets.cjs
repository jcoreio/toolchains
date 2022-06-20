module.exports = [
  (api) => {
    const { JCOREIO_TOOLCHAIN_MJS } = process.env
    api.cache.using(() => JCOREIO_TOOLCHAIN_MJS)
    return [
      [
        require.resolve('@babel/preset-env'),
        {
          ...(JCOREIO_TOOLCHAIN_MJS
            ? {
                targets: {
                  node: 16,
                },
              }
            : { forceAllTransforms: true }),
          modules: JCOREIO_TOOLCHAIN_MJS ? false : 'auto',
        },
      ],
    ]
  },
]

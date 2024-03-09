module.exports = [
  (api) => {
    const { JCOREIO_TOOLCHAIN_ESM } = process.env
    api.cache.using(() => JCOREIO_TOOLCHAIN_ESM)
    return [
      require.resolve('@babel/plugin-transform-runtime'),
      !JCOREIO_TOOLCHAIN_ESM &&
        require.resolve('babel-plugin-add-module-exports'),
    ].filter(Boolean)
  },
]

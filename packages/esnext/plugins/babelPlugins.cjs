module.exports = [
  (api) => {
    const { JCOREIO_TOOLCHAIN_MJS } = process.env
    api.cache.using(() => JCOREIO_TOOLCHAIN_MJS)
    return [
      require.resolve('@babel/plugin-transform-runtime'),
      !JCOREIO_TOOLCHAIN_MJS &&
        require.resolve('babel-plugin-add-module-exports'),
    ].filter(Boolean)
  },
]

const { packageJson } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  (api) => {
    const {
      JCOREIO_TOOLCHAIN_CJS,
      JCOREIO_TOOLCHAIN_ESM,
      JCOREIO_TOOLCHAIN_TEST,
    } = process.env
    api.cache.using(() => JCOREIO_TOOLCHAIN_CJS)
    api.cache.using(() => JCOREIO_TOOLCHAIN_ESM)
    api.cache.using(() => JCOREIO_TOOLCHAIN_TEST)
    api.cache.using(() => packageJson.type)

    const cjsExtension = packageJson.type === 'module' ? '.cjs' : '.js'
    const esmExtension = packageJson.type === 'module' ? '.js' : '.mjs'

    return [
      require.resolve('@babel/plugin-transform-runtime'),
      (JCOREIO_TOOLCHAIN_CJS || JCOREIO_TOOLCHAIN_ESM) && [
        require.resolve('../util/babelPluginResolveImports.cjs'),
        {
          outputExtension:
            JCOREIO_TOOLCHAIN_TEST ? undefined
            : JCOREIO_TOOLCHAIN_ESM ? esmExtension
            : JCOREIO_TOOLCHAIN_CJS ? cjsExtension
            : packageJson.type === 'module' ? esmExtension
            : cjsExtension,
        },
      ],
      !JCOREIO_TOOLCHAIN_ESM &&
        require.resolve('babel-plugin-add-module-exports'),
    ].filter(Boolean)
  },
]

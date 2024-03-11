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
    return [
      require.resolve('@babel/plugin-transform-runtime'),
      // for CJS tests, we leave off import extensions, since @babel/register resolves them.
      // for ESM tests, we resolve to .js for babel-register-esm.
      // for CJS build, we resolve to .js.
      // for ESM build, we resolve to .mjs.
      ((JCOREIO_TOOLCHAIN_CJS && !JCOREIO_TOOLCHAIN_TEST) ||
        JCOREIO_TOOLCHAIN_ESM) && [
        require.resolve('../util/babelPluginResolveImports.cjs'),
        {
          outputExtension:
            JCOREIO_TOOLCHAIN_ESM && !JCOREIO_TOOLCHAIN_TEST ? '.mjs' : '.js',
        },
      ],
      !JCOREIO_TOOLCHAIN_ESM &&
        require.resolve('babel-plugin-add-module-exports'),
    ].filter(Boolean)
  },
]

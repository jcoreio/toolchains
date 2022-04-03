/* eslint-env node */
module.exports = function (api) {
  api.cache(true)
  return {
    extends: require.resolve('@jcoreio/toolchain-esnext/.babelrc.cjs'),
    presets: [require.resolve('@babel/preset-flow')],
  }
}

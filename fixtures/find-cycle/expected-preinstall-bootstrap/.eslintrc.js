/* eslint-env node */
module.exports = {
  extends: [require.resolve('@jcoreio/toolchain/eslint.config.cjs')],
  env: {
    commonjs: true,
    es6: true,
  },
}

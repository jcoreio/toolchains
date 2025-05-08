/* eslint-env node, es2018 */
process.env.JCOREIO_TOOLCHAIN_SELF_TEST = '1'
module.exports = {
  ...require('@jcoreio/toolchain/prettierConfig.cjs'),
}

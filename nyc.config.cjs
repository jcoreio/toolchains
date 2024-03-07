/* eslint-env node, es2018 */
module.exports = {
  ...require('@jcoreio/toolchain-mocha/nyc.config.cjs'),
  include: ['packages/**'],
}

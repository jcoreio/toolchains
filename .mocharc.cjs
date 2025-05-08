/* eslint-env node, es2018 */
const { getSpecs } = require('@jcoreio/toolchain-mocha')

module.exports = {
  ...require('@jcoreio/toolchain-mocha/.mocharc.cjs'),
  spec: getSpecs(['test/**/*.js']),
}

/* eslint-env node, es2018 */

const { getSpecs } = require('@jcoreio/toolchain-mocha')

module.exports = {
  ...require('./.mocharc.cjs'),
  spec: getSpecs(['test/integration/**/*.js']),
}

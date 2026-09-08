const base = require('@jcoreio/toolchain-mocha/.mocharc.cjs')
module.exports = {
  ...base,
  require: [...base.require, 'test/configure.js'],
}

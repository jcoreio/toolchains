const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = [
  async (args = []) => {
    await execa('nyc', ['mocha', ...args])
  },
]

const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = [
  async () => {
    await execa('tsc')
  },
]

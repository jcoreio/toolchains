const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = [
  [
    async function compile(args = []) {
      await execa('babel', ['src', '--out-dir', 'dist'])
    },
    { insteadOf: '@jcoreio/toolchain' },
  ],
]

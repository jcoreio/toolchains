const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = [
  [
    async function compile(args = []) {
      await execa('tsc', ['-p', 'tsconfig.build.json'])
    },
    { after: '@jcoreio/toolchain-esnext' },
  ],
]

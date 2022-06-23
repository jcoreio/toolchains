const execa = require('@jcoreio/toolchain/util/execa.cjs')
const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')

module.exports = [
  [
    async function compile(args = []) {
      if (hasTSSourcesSync()) await execa('tsc', ['-p', 'tsconfig.build.json'])
    },
    { after: '@jcoreio/toolchain-esnext' },
  ],
]

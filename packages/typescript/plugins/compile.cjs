const { toolchainConfig } = require('@jcoreio/toolchain/util/findUps.cjs')
const execa = require('@jcoreio/toolchain/util/execa.cjs')
const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')

module.exports = [
  [
    async function compile(args = []) {
      if (hasTSSourcesSync()) {
        await execa('tsc', [
          '-p',
          'tsconfig.build.json',
          ...(toolchainConfig.sourceMaps ? ['--declarationMap'] : []),
        ])
      }
    },
    { after: ['@jcoreio/toolchain'], before: ['@jcoreio/toolchain-esnext'] },
  ],
]

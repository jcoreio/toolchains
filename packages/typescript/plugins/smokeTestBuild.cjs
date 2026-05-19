const execa = require('@jcoreio/toolchain/util/execa.cjs')
const { toolchainConfig } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  async function smokeTestBuild() {
    await execa(
      'pnpm',
      [
        'exec',
        // used to just dlx the package but we need to pin transitive deps to work
        // around bugs
        'attw',
        '--pack',
        '.',
        ...(toolchainConfig.outputCjs === false ?
          ['--profile', 'esm-only']
        : []),
      ],
      { cwd: 'dist' }
    )
  },
]

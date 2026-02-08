const execa = require('@jcoreio/toolchain/util/execa.cjs')
const { toolchainConfig } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  async function smokeTestBuild() {
    await execa(
      'pnpm',
      [
        '--package=@arethetypeswrong/cli',
        'dlx',
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

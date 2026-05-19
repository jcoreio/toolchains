const execa = require('@jcoreio/toolchain/util/execa.cjs')
const path = require('path')
const {
  projectDir,
  toolchainConfig,
} = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  async function smokeTestBuild() {
    await execa(
      'pnpm',
      [
        'exec',
        'attw',
        '--pack',
        path.join(projectDir, 'dist'),
        ...(toolchainConfig.outputCjs === false ?
          ['--profile', 'esm-only']
        : []),
      ],
      { cwd: __dirname }
    )
  },
]

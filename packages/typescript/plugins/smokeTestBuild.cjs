const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = [
  async function smokeTestBuild() {
    await execa(
      'pnpm',
      ['--package=@arethetypeswrong/cli', 'dlx', 'attw', '--pack', '.'],
      { cwd: 'dist' }
    )
  },
]

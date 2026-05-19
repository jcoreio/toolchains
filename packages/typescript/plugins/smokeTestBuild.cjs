const execa = require('@jcoreio/toolchain/util/execa.cjs')
const { toolchainConfig } = require('@jcoreio/toolchain/util/findUps.cjs')
const fs = require('fs/promises')
const path = require('path')

module.exports = [
  async function smokeTestBuild() {
    const attwDir = path.resolve(
      __dirname,
      '../node_modules/@arethetypeswrong/cli'
    )
    const { bin } = JSON.parse(
      await fs.readFile(path.resolve(attwDir, 'package.json'))
    )
    const attw = path.resolve(
      attwDir,
      typeof bin === 'string' ? bin : bin && bin.attw
    )
    await execa(
      process.execPath,
      [
        // used to just dlx the package but we need to pin transitive deps to work
        // around bugs
        attw,
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

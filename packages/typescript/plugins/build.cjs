const Path = require('path')
const glob = require('glob')
const { promisify } = require('util')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const execa = require('@jcoreio/toolchain/util/execa.cjs')
const { projectDir } = require('@jcoreio/toolchain/util/findUps.cjs')
const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')

module.exports = [
  [
    async function build(args = []) {
      if (hasTSSourcesSync()) {
        await execa('tsc', ['-p', 'tsconfig.build.json'])
      } else {
        const dtsFiles = await promisify(glob)(
          Path.join('src', '**', '*.d.ts'),
          {
            cwd: projectDir,
          }
        )
        await Promise.all(
          dtsFiles.map(async (src) => {
            const dest = Path.join('dist', Path.relative('src', src))
            // eslint-disable-next-line no-console
            console.error(src, '->', dest)
            await fs.copy(src, dest)
          })
        )
      }
    },
    { after: ['@jcoreio/toolchain', '@jcoreio/toolchain-esnext'] },
  ],
]

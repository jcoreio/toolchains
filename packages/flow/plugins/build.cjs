const Path = require('path')
const glob = require('glob')
const { promisify } = require('util')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const { projectDir } = require('@jcoreio/toolchain/util/findUps.cjs')
const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')

module.exports = [
  [
    async function build(args = []) {
      if (hasTSSourcesSync()) {
        const flowFiles = await promisify(glob)(
          Path.join('src', '**', '*.js.flow'),
          {
            cwd: projectDir,
          }
        )
        await Promise.all(
          flowFiles.map(async (src) => {
            const dest = Path.join('dist', Path.relative('src', src))
            // eslint-disable-next-line no-console
            console.error(src, '->', dest)
            await fs.copy(src, dest)
          })
        )
      } else {
        const jsFiles = await promisify(glob)(
          Path.join('src', '**', '*.{js,cjs,mjs}'),
          {
            cwd: projectDir,
          }
        )
        await Promise.all(
          jsFiles.map(async (src) => {
            const dest = Path.join('dist', Path.relative('src', src)).replace(
              /\.[cm]?js$/,
              '.js.flow'
            )
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

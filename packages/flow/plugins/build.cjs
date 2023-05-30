const Path = require('path')
const glob = require('glob')
const { promisify } = require('util')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const { projectDir } = require('@jcoreio/toolchain/util/findUps.cjs')
const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')
const resolveImportsCodemod = require('@jcoreio/toolchain-esnext/util/resolveImportsCodemod.cjs')

module.exports = [
  [
    async function build(args = []) {
      if (!hasTSSourcesSync()) {
        const jsFiles = await promisify(glob)(
          Path.join('src', '**', '*.{js,cjs,mjs}'),
          {
            cwd: projectDir,
          }
        )
        for (const ext of ['.js.flow', '.mjs.flow']) {
          await Promise.all(
            jsFiles.map(async (src) => {
              const dest = Path.join('dist', Path.relative('src', src)).replace(
                /\.[cm]?js$/,
                ext
              )
              // eslint-disable-next-line no-console
              console.error(src, '->', dest)
              await fs.copy(src, dest)
            })
          )
        }
        const flowFiles = await promisify(glob)(
          Path.join('dist', '**', '*.{js,cjs,mjs}.flow'),
          {
            cwd: projectDir,
          }
        )
        await resolveImportsCodemod(flowFiles)
      }
    },
    { after: ['@jcoreio/toolchain', '@jcoreio/toolchain-esnext'] },
  ],
]

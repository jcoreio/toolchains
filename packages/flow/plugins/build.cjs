const Path = require('path')
const glob = require('@jcoreio/toolchain/util/glob.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')
const resolveImportsCodemod = require('@jcoreio/toolchain-esnext/util/resolveImportsCodemod.cjs')

module.exports = [
  [
    async function build(args = []) {
      if (!hasTSSourcesSync()) {
        const jsFiles = await glob(Path.join('src', '**', '*.{js,cjs,mjs}'))
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
        const flowFiles = await glob(
          Path.join('dist', '**', '*.{js,cjs,mjs}.flow')
        )
        await resolveImportsCodemod(flowFiles)
      }
    },
    { after: ['@jcoreio/toolchain', '@jcoreio/toolchain-esnext'] },
  ],
]

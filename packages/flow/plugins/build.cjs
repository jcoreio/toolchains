const Path = require('path')
const { glob } = require('@jcoreio/toolchain/util/glob.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const hasTSSources = require('@jcoreio/toolchain/util/hasTSSources.cjs')
const resolveImportsCodemod = require('@jcoreio/toolchain-esnext/util/resolveImportsCodemod.cjs')
const { toolchainConfig } = require('@jcoreio/toolchain/util/findUps.cjs')
const buildGlobOpts = require('@jcoreio/toolchain/util/buildGlobOpts.cjs')

module.exports = [
  [
    async function build(args = []) {
      if (!(await hasTSSources())) {
        const jsFiles = await glob(
          Path.join('src', '**', '*.{js,cjs,mjs}'),
          buildGlobOpts
        )
        for (const ext of [
          '.js.flow',
          ...(toolchainConfig.outputEsm !== false ? ['.mjs.flow'] : []),
        ]) {
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

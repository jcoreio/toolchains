const Path = require('path')
const { toolchainConfig } = require('@jcoreio/toolchain/util/findUps.cjs')
const execa = require('@jcoreio/toolchain/util/execa.cjs')
const { glob } = require('@jcoreio/toolchain/util/glob.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')

module.exports = [
  [
    async function compile(args = []) {
      if (hasTSSourcesSync()) {
        await execa('tsc', [
          '-p',
          'tsconfig.build.json',
          ...(toolchainConfig.sourceMaps ? ['--declarationMap'] : []),
        ])
        const dtsFiles = await glob(Path.join('dist', '**', '*.d.ts'))
        await Promise.all(
          dtsFiles.map(async (src) => {
            const dest = src.replace(/\.d\.ts$/, '.d.mts')
            // eslint-disable-next-line no-console
            console.error(src, '->', dest)
            let content = await fs.readFile(src, 'utf8')
            if (
              content.endsWith(`sourceMappingURL=${Path.basename(src)}.map`)
            ) {
              content =
                content.substring(
                  0,
                  content.length -
                    `sourceMappingURL=${Path.basename(src)}.map`.length
                ) + `sourceMappingURL=${Path.basename(dest)}.map`
            }
            await fs.writeFile(dest, content, 'utf8')
          })
        )
        const mapFiles = await glob(Path.join('dist', '**', '*.d.ts.map'))
        await Promise.all(
          mapFiles.map(async (src) => {
            const dest = src.replace(/\.d\.ts.map$/, '.d.mts.map')
            const map = await fs.readJson(src)
            map.file = Path.basename(dest)
            // eslint-disable-next-line no-console
            console.error(src, '->', dest)
            await fs.writeJson(dest, map)
          })
        )
      }
    },
    { after: ['@jcoreio/toolchain'], before: ['@jcoreio/toolchain-esnext'] },
  ],
]

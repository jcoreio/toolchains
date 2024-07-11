const execa = require('@jcoreio/toolchain/util/execa.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const glob = require('@jcoreio/toolchain/util/glob.cjs')
const path = require('path')
const dedent = require('dedent-js')
const {
  toolchainConfig,
  projectDir,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')
const fixSourceMaps = require('../util/fixSourceMaps.cjs')

module.exports = [
  [
    async function compile(args = []) {
      const extensions = getPluginsArraySync('babelExtensions')

      await execa(
        'babel',
        [
          'src',
          ...(extensions.length ? ['--extensions', extensions.join(',')] : []),
          ...(extensions.includes('.ts') ? ['--ignore', '**/*.d.ts'] : []),
          '--out-dir',
          'dist',
          '--out-file-extension',
          '.js',
          ...(toolchainConfig.sourceMaps
            ? ['--source-maps', toolchainConfig.sourceMaps]
            : []),
        ],
        { env: { ...process.env, JCOREIO_TOOLCHAIN_CJS: '1' } }
      )

      const jsFiles = await glob(path.join('dist', '**', '*.js'))
      if (toolchainConfig.outputEsm !== false) {
        if (toolchainConfig.esWrapper) {
          await Promise.all(
            jsFiles.map((file) =>
              fs.writeFile(
                file.replace(/\.js$/, '.mjs'),
                dedent`
                export * from './${path.basename(file)}'
                import root from './${path.basename(file)}'
                export default root

              `,
                'utf8'
              )
            )
          )
        } else {
          await execa(
            'babel',
            [
              'src',
              ...(extensions.length
                ? ['--extensions', extensions.join(',')]
                : []),
              '--out-dir',
              'dist',
              '--out-file-extension',
              '.mjs',
              ...(toolchainConfig.sourceMaps
                ? ['--source-maps', toolchainConfig.sourceMaps]
                : []),
            ],
            { env: { ...process.env, JCOREIO_TOOLCHAIN_ESM: '1' } }
          )
        }
      }

      if (extensions.length) {
        for (const ext of ['.js', '.mjs']) {
          if (!extensions.includes(ext)) {
            const srcFiles = await glob(path.join('**', '*' + ext), {
              cwd: path.join(projectDir, 'src'),
            })
            for (const file of srcFiles) {
              // eslint-disable-next-line no-console
              console.error(
                path.join('src', file),
                '->',
                path.join('dist', file)
              )
              await fs.copy(path.join('src', file), path.join('dist', file))
            }
          }
        }
      }

      if (toolchainConfig.sourceMaps) {
        const srcFiles = await glob(path.join('src', '**'), { nodir: true })
        await Promise.all(
          srcFiles.map(async (src) => {
            if (src === 'src') return
            const dest = path.join('dist', src)
            // eslint-disable-next-line no-console
            console.error(src, '->', dest)
            await fs.copy(src, dest)
          })
        )

        await fixSourceMaps()
      }
    },
    { insteadOf: '@jcoreio/toolchain' },
  ],
]

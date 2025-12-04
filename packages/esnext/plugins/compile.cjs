const execa = require('@jcoreio/toolchain/util/execa.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const { glob, globIterate } = require('@jcoreio/toolchain/util/glob.cjs')
const buildGlobOpts = require('@jcoreio/toolchain/util/buildGlobOpts.cjs')
const path = require('path')
const dedent = require('dedent-js')
const {
  packageJson,
  toolchainConfig,
  projectDir,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')
const fixSourceMaps = require('../util/fixSourceMaps.cjs')

async function hasSourceFilesForExtension(extension) {
  const ignore = [
    ...(toolchainConfig.buildIgnore || []),
    ...(/\.[cm]?ts$/i.test(extension) ? [`**/*.d${extension}`] : []),
  ]
  for await (const file of globIterate(`src/**/*${extension}`, {
    ignore: ignore.length ? ignore : undefined,
  })) {
    return true
  }
  return false
}

module.exports = [
  [
    async function compile(args = []) {
      const extensions = getPluginsArraySync('sourceExtensions').map(
        (ext) => `.${ext}`
      )

      for (const extension of extensions) {
        if (extension.startsWith('.m')) continue
        if (!(await hasSourceFilesForExtension(extension))) continue
        await execa(
          'babel',
          [
            'src',
            '--extensions',
            extension,
            ...(/\.[cm]?ts$/i.test(extension) ?
              ['--ignore', '**/*.d' + extension]
            : []),
            ...(toolchainConfig.buildIgnore || []).flatMap((pattern) => [
              '--ignore',
              pattern,
            ]),
            ...(extension.startsWith('.c') ?
              []
            : (
                await glob(
                  `src/**/*${extension.replace('.', '.c')}`,
                  buildGlobOpts
                )
              ).flatMap((file) => [
                '--ignore',
                file.replace(/\.c([jt]sx?)$/i, '.$1'),
              ])),
            '--out-dir',
            'dist',
            '--out-file-extension',
            /\.c[tj]sx?$/i.test(extension) || packageJson.type === 'module' ?
              '.cjs'
            : '.js',
            ...(toolchainConfig.sourceMaps ?
              ['--source-maps', toolchainConfig.sourceMaps]
            : []),
          ],
          { env: { ...process.env, JCOREIO_TOOLCHAIN_CJS: '1' } }
        )
      }

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
          for (const extension of extensions) {
            if (extension.startsWith('.c')) continue
            if (!(await hasSourceFilesForExtension(extension))) continue
            await execa(
              'babel',
              [
                'src',
                '--extensions',
                extension,
                ...(/\.[cm]?ts$/i.test(extension) ?
                  ['--ignore', '**/*.d' + extension]
                : []),
                ...(toolchainConfig.buildIgnore || []).flatMap((pattern) => [
                  '--ignore',
                  pattern,
                ]),
                ...(extension.startsWith('.m') ?
                  []
                : (
                    await glob(
                      `src/**/*${extension.replace('.', '.m')}`,
                      buildGlobOpts
                    )
                  ).flatMap((file) => [
                    '--ignore',
                    file.replace(/\.m([jt]sx?)$/i, '.$1'),
                  ])),
                '--out-dir',
                'dist',
                '--out-file-extension',
                /\.m[tj]sx?$/.test(extension) || packageJson.type !== 'module' ?
                  '.mjs'
                : '.js',
                ...(toolchainConfig.sourceMaps ?
                  ['--source-maps', toolchainConfig.sourceMaps]
                : []),
              ],
              { env: { ...process.env, JCOREIO_TOOLCHAIN_ESM: '1' } }
            )
          }
        }
      }

      if (extensions.length) {
        for (const ext of ['.js', '.cjs', '.mjs']) {
          if (!extensions.includes(ext)) {
            const srcFiles = await glob(path.join('**', '*' + ext), {
              ...buildGlobOpts,
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
        const srcFiles = await glob(path.join('src', '**'), {
          ...buildGlobOpts,
          nodir: true,
        })
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

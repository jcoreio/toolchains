const execa = require('@jcoreio/toolchain/util/execa.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const glob = require('@jcoreio/toolchain/util/glob.cjs')
const path = require('path')
const dedent = require('dedent-js')
const { packageJson } = require('@jcoreio/toolchain/util/findUps.cjs')
const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')
const resolveImportsCodemod = require('../util/resolveImportsCodemod.cjs')

module.exports = [
  [
    async function compile(args = []) {
      const config = packageJson['@jcoreio/toolchain']
      const extensions = getPluginsArraySync('babelExtensions')

      await execa('babel', [
        'src',
        ...(extensions.length ? ['--extensions', extensions.join(',')] : []),
        '--out-dir',
        'dist',
        '--out-file-extension',
        '.js',
      ])
      const jsFiles = await glob(path.join('dist', '**', '*.js'))
      await resolveImportsCodemod(jsFiles)
      if (config && config.esWrapper) {
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
          ],
          { env: { ...process.env, JCOREIO_TOOLCHAIN_MJS: '1' } }
        )
        const mjsFiles = await glob(path.join('dist', '**', '*.mjs'))
        await resolveImportsCodemod(mjsFiles)
      }
    },
    { insteadOf: '@jcoreio/toolchain' },
  ],
]

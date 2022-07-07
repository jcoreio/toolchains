const execa = require('@jcoreio/toolchain/util/execa.cjs')
const { promisify } = require('util')
const path = require('path')
const glob = require('glob')
const fs = require('fs-extra')
const dedent = require('dedent-js')
const { packageJson } = require('@jcoreio/toolchain/util/findUps.cjs')
const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')

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
        '.cjs',
      ])
      if (config && config.esWrapper) {
        const cjsFiles = await promisify(glob)(path.join('dist', '**.cjs'))
        await Promise.all(
          cjsFiles.map((file) =>
            fs.writeFile(
              file.replace(/\.cjs$/, '.mjs'),
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
      }
    },
    { insteadOf: '@jcoreio/toolchain' },
  ],
]

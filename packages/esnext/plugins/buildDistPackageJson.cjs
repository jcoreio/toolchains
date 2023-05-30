const { promisify } = require('util')
const glob = require('glob')
const Path = require('path')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const { projectDir } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  [
    async function buildDistPackageJson(packageJson) {
      const distDir = Path.join(projectDir, 'dist')
      const files = await promisify(glob)('**.{js,cjs,mjs,d.ts}', {
        cwd: distDir,
      })
      const exportMap = { './package.json': './package.json' }
      let usesBabelRuntime = false
      for (const file of files) {
        const key = `./${file.replace(/(\.[^/.]*)*$/, '')}`.replace(
          /\/index$/,
          ''
        )
        const forFile = exportMap[key] || (exportMap[key] = {})
        forFile[
          /\.d\.ts$/.test(file)
            ? 'types'
            : /\.c?js$/.test(file)
            ? 'require'
            : 'import'
        ] = `./${file}`
        usesBabelRuntime =
          usesBabelRuntime ||
          // this could return false positives in rare cases, but keeps the test simple
          (await fs.readFile(Path.join('dist', file))).includes(
            '@babel/runtime'
          )
      }
      if (!packageJson.exports) {
        packageJson.exports = exportMap
      }
      const indexExport = exportMap['.']
      if (indexExport) {
        if (indexExport.require) packageJson.main = indexExport.require
        if (indexExport.import) packageJson.module = indexExport.import
        if (indexExport.types) packageJson.types = indexExport.types
      }
      packageJson.main = indexExport.require
      if (!usesBabelRuntime) {
        const { dependencies } = packageJson
        if (dependencies) delete dependencies['@babel/runtime']
      }
    },
    { after: '@jcoreio/toolchain' },
  ],
]

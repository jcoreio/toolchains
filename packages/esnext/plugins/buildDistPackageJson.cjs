const glob = require('@jcoreio/toolchain/util/glob.cjs')
const Path = require('path')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')

module.exports = [
  [
    async function buildDistPackageJson(packageJson) {
      const files = await glob(Path.join('dist', '**', '*.{js,cjs,mjs,d.ts}'))
      const exportMap = { './package.json': './package.json' }
      let usesBabelRuntime = false
      for (const file of files) {
        const fileInDist = `./${Path.relative('dist', file)}`
        const key = fileInDist
          .replace(/(\.[^/.]*)*$/, '')
          .replace(/\/index$/, '')
        const forFile = exportMap[key] || (exportMap[key] = {})
        const condition = /\.d\.ts$/.test(file)
          ? 'types'
          : /\.c?js$/.test(file)
          ? 'require'
          : 'import'
        forFile[condition] = fileInDist
        usesBabelRuntime =
          usesBabelRuntime ||
          // this could return false positives in rare cases, but keeps the test simple
          (await fs.readFile(file)).includes('@babel/runtime')
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

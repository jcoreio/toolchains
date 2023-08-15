const glob = require('@jcoreio/toolchain/util/glob.cjs')
const Path = require('path')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')

module.exports = [
  [
    async function buildDistPackageJson(packageJson) {
      const files = await glob(Path.join('dist', '**', '*.{js,cjs,mjs,d.ts}'))
      let usesBabelRuntime = false
      for (const file of files) {
        if ((await fs.readFile(file, 'utf8')).includes('@babel/runtime')) {
          usesBabelRuntime = true
          break
        }
      }
      if (!usesBabelRuntime) {
        const { dependencies } = packageJson
        if (dependencies) delete dependencies['@babel/runtime']
      }
    },
    { after: '@jcoreio/toolchain' },
  ],
]

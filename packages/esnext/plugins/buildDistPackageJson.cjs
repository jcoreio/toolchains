const { promisify } = require('util')
const glob = require('glob')
const Path = require('path')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const { projectDir } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  [
    async function buildDistPackageJson(packageJson) {
      const distDir = Path.join(projectDir, 'dist')
      const files = await promisify(glob)('**.{cjs,mjs}', {
        cwd: distDir,
      })
      const exportMap = { './package.json': './package.json' }
      let usesBabelRuntime = false
      for (const file of files) {
        const key = `./${file.replace(/\.[^.]*$/, '')}`
        const forFile = exportMap[key] || (exportMap[key] = {})
        forFile[/\.cjs$/.test(file) ? 'require' : 'import'] = `./${file}`
        usesBabelRuntime =
          usesBabelRuntime ||
          // this could return false positives in rare cases, but keeps the test simple
          (await fs.readFile(Path.join(distDir, file))).includes(
            '@babel/runtime'
          )
      }
      if (!packageJson.exports) {
        packageJson.exports = exportMap
      }
      if (!usesBabelRuntime) {
        const { dependencies } = packageJson
        if (dependencies) delete dependencies['@babel/runtime']
      }
    },
    { after: '@jcoreio/toolchain' },
  ],
]

const { promisify } = require('util')
const glob = require('glob')

module.exports = [
  [
    async function buildDistPackageJson(packageJson) {
      if (!packageJson.exports) {
        const files = await promisify(glob)('**.{cjs,mjs}', { cwd: 'dist' })

        const exportMap = { './package.json': './package.json' }
        for (const file of files) {
          const key = `./${file.replace(/\.[^.]*$/, '')}`
          const forFile = exportMap[key] || (exportMap[key] = {})
          forFile[/\.cjs$/.test(file) ? 'require' : 'import'] = `./${file}`
        }
        packageJson.exports = exportMap
      }
    },
    { after: '@jcoreio/toolchain' },
  ],
]

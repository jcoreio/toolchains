const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const path = require('path')
const { projectDir } = require('@jcoreio/toolchain/util/findUps.cjs')
const transformImportSources = require('./transformImportSources.cjs')
const resolveImportSource = require('./resolveImportSource.cjs')

module.exports = async function resolveImportsCodemod(files) {
  await Promise.all(
    files.map(async (file) => {
      file = path.resolve(projectDir, file)
      const transformed = await transformImportSources({
        file,
        transform: resolveImportSource,
      })
      await fs.writeFile(file, transformed, 'utf8')
    })
  )
}

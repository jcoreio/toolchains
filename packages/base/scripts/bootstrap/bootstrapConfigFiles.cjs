const fs = require('../../util/projectFs.cjs')
const getPluginsObject = require('../../util/getPluginsObject.cjs')

async function bootstrapConfigFiles() {
  const files = await getPluginsObject('getConfigFiles')
  for (const file in files) {
    const value = files[file]
    const content = typeof value === 'string' ? value : value.content
    const overwrite = typeof value === 'string' ? false : value.overwrite
    if (overwrite || !(await fs.pathExists(file))) {
      await fs.writeFile(file, content, 'utf8')
      // eslint-disable-next-line no-console
      console.error(`wrote ${file}`)
    }
  }
}

module.exports = bootstrapConfigFiles

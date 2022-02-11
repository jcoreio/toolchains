const fs = require('../../util/projectFs.cjs')
const getPluginsObject = require('../../util/getPluginsObject.cjs')

async function bootstrapConfigFiles() {
  const files = await getPluginsObject('getConfigFiles')
  for (const file in files) {
    await fs.writeFile(file, files[file], 'utf8')
    // eslint-disable-next-line no-console
    console.error(`wrote ${file}`)
  }
}

module.exports = bootstrapConfigFiles

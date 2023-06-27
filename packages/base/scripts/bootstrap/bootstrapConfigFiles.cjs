const fs = require('../../util/projectFs.cjs')
const path = require('path')
const getPluginsObject = require('../../util/getPluginsObject.cjs')
const { name } = require('../../package.json')

async function bootstrapConfigFiles() {
  const files = await getPluginsObject('getConfigFiles')
  for (const file in files) {
    const value = files[file]
    let content, overwrite
    if (typeof value === 'function') {
      const prev = await fs.readFile(file, 'utf8').catch(() => undefined)
      content = await value(prev)
      overwrite = content !== prev
    } else {
      content = typeof value === 'string' ? value : value.content
      overwrite = typeof value === 'string' ? false : value.overwrite
    }
    if (
      overwrite === true ||
      !(await fs.pathExists(file)) ||
      (content.includes(name) &&
        !(await fs.readFile(file, 'utf8')).includes(name))
    ) {
      await fs.mkdirs(path.dirname(file))
      await fs.writeFile(file, content, 'utf8')
      // eslint-disable-next-line no-console
      console.error(`wrote ${file}`)
    }
  }
}

module.exports = bootstrapConfigFiles

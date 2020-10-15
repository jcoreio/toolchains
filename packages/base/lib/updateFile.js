const fs = require('fs-extra')

module.exports = async function updateFile(file, options, updater) {
  const original = await fs.readFile(file, options).catch((err) => {
    if (err.code !== 'ENOENT') throw err
    return ''
  })
  const updated = await updater(original)
  if (updated && updated !== original) {
    await fs.writeFile(file, updated, options)
    console.log(`wrote ${file}`) // eslint-disable-line no-console
  }
}

const fs = require('./projectFs.cjs')
const once = require('./once.cjs')

module.exports = once(async function hasTSFiles() {
  const files = await fs.readdir('src')
  return files.some((f) => /\.[cm]?tsx?$/.test(f))
})

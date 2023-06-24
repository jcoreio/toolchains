const fs = require('./projectFs.cjs')
const once = require('./once.cjs')

module.exports = once(async function hasFlowFiles() {
  const files = await fs.readdir('src')
  return files.some((f) => /\.flow$/.test(f))
})

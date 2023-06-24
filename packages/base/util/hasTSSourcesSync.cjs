const fs = require('./projectFs.cjs')
const once = require('./once.cjs')

module.exports = once(function hasTSSourcesSync() {
  const files = fs.readdirSync('src')
  return files.some((f) => /\.[cm]?tsx?$/.test(f) && !/\.d\.[cm]?tsx?$/.test(f))
})

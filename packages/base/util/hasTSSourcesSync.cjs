const fs = require('./projectFs.cjs')
const once = require('./once.cjs')

module.exports = once(function hasTSSourcesSync() {
  const files = fs.readdirSync('src')
  return files.find((f) => /\.tsx?$/.test(f) && !/\.d\.tsx?$/.test(f)) != null
})

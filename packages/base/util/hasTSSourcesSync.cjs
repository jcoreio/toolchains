const path = require('path')
const fs = require('./projectFs.cjs')
const once = require('./once.cjs')

function hasTSSources(path, depth) {
  if (depth > 10) return false
  const files = fs.readdirSync(path, { withFileTypes: true })
  // first check files in this directory
  if (
    files.some(
      (f) =>
        f.isFile() &&
        /\.[cm]?tsx?$/.test(f.name) &&
        !/\.d\.[cm]?tsx?$/.test(f.name)
    )
  )
    return true
  // if there were no TS files in this directory, recursively check subdirectories
  return files.some(
    (f) => f.isDirectory() && hasTSSources(path.join(path, f.name), depth + 1)
  )
}

module.exports = once(() => hasTSSources('src', 0))

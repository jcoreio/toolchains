const once = require('./once.cjs')
const { glob } = require('./glob.cjs')

module.exports = once(async function hasTSFiles() {
  const files = await glob('**/*.{ts,tsx}')
  return files.length > 0
})

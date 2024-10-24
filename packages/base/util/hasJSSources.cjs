const once = require('./once.cjs')
const { globExists } = require('./glob.cjs')

module.exports = once(async function hasJSSources() {
  return await globExists('src/**/*.{js,cjs,mjs,jsx,cjsx,mjsx}')
})

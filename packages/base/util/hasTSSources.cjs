const once = require('./once.cjs')
const { globExists } = require('./glob.cjs')
const { toolchainConfig } = require('./findUps.cjs')

module.exports = once(async function hasTSSources() {
  if (
    toolchainConfig &&
    typeof toolchainConfig.hasTypeScriptSources === 'boolean'
  ) {
    return toolchainConfig.hasTypeScriptSources
  }
  return await globExists('src/**/*.{ts,cts,mts,tsx,ctsx,mtsx}', {
    ignore: '**/*.d.{ts,cts,mts}',
  })
})

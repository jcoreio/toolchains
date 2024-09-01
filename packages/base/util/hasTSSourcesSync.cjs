const once = require('./once.cjs')
const { globExistsSync } = require('./glob.cjs')
const { toolchainConfig } = require('./findUps.cjs')

module.exports = once(function hasTSSourcesSync() {
  if (
    toolchainConfig &&
    typeof toolchainConfig.hasTypeScriptSources === 'boolean'
  ) {
    return toolchainConfig.hasTypeScriptSources
  }
  return globExistsSync('src/**/*.{ts,cts,mts,tsx,ctsx,mtsx}', {
    ignore: '**/*.d.{ts,cts,mts}',
  })
})

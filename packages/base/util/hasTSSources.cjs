const once = require('./once.cjs')
const { globIterate } = require('./glob.cjs')
const { config } = require('./findUps.cjs')

module.exports = once(async function hasTSSources() {
  if (config && typeof config.hasTypeScriptSources === 'boolean') {
    return config.hasTypeScriptSources
  }
  for await (const file of globIterate('src/**/*.{ts,cts,mts,tsx,ctsx,mtsx}', {
    ignore: '**/*.d.{ts,cts,mts}',
  })) {
    return true
  }
  return false
})

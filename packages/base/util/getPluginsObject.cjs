const getPlugins = require('./getPlugins.cjs')

async function getPluginsObject(name, ...args) {
  const plugins = getPlugins(name)
  const result = {}
  for (const plugin of plugins) {
    Object.assign(result, await plugin(...args))
  }
  return result
}

module.exports = getPluginsObject

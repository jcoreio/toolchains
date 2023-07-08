const getPlugins = require('./getPlugins.cjs')

function getPluginsObjectSync(name, ...args) {
  const plugins = getPlugins(name)
  const result = {}
  for (const plugin of plugins) {
    Object.assign(
      result,
      typeof plugin === 'function' ? plugin(...args) : plugin
    )
  }
  return result
}

module.exports = getPluginsObjectSync

const getPlugins = require('./getPlugins.cjs')

async function getPluginsObjectAsync(name, ...args) {
  const plugins = getPlugins(name)
  const result = {}
  for (const plugin of plugins) {
    Object.assign(
      result,
      typeof plugin === 'function' ? await plugin(...args) : plugin
    )
  }
  return result
}

module.exports = getPluginsObjectAsync

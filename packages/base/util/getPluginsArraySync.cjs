const getPlugins = require('./getPlugins.cjs')

function getPluginsArraySync(name, ...args) {
  const plugins = getPlugins(name)
  const result = []
  for (const plugin of plugins) {
    const output = plugin(...args)
    if (Array.isArray(output)) output.forEach((el) => result.push(el))
    else if (output != null) result.push(output)
  }
  return result
}

module.exports = getPluginsArraySync

const getPlugins = require('./getPlugins.cjs')

async function getPluginsArraySync(name, ...args) {
  const plugins = getPlugins(name)
  const result = []
  for (const plugin of plugins) {
    const output = await plugin(...args)
    if (Array.isArray(output)) output.forEach((el) => result.push(el))
    else if (output != null) result.push(output)
  }
  return result
}

module.exports = getPluginsArraySync

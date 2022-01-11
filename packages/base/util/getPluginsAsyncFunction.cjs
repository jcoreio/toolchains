const getPlugins = require('./getPlugins.cjs')

function getPluginsAsyncFunction(name) {
  const plugins = getPlugins(name)
  return async function (...args) {
    for (const plugin of plugins) {
      await plugin(...args)
    }
  }
}

module.exports = getPluginsAsyncFunction

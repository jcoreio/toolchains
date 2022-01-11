const Path = require('path')
const sortPlugins = require('./sortPlugins.cjs')
const { toolchainPackages } = require('./findUps.cjs')

function getPlugins(name) {
  const plugins = {}
  for (const pkg of toolchainPackages) {
    let path
    try {
      path = require.resolve(Path.join(pkg, 'plugins', `${name}.cjs`))
    } catch (error) {
      continue
    }
    plugins[pkg] = require(path)
  }
  return sortPlugins(plugins)
}

module.exports = getPlugins

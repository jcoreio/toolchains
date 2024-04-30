const Path = require('path')
const sortPlugins = require('./sortPlugins.cjs')

function getPlugins(name) {
  const { projectDir, toolchainPackages } = require('./findUps.cjs')
  const plugins = {}
  for (const pkg of toolchainPackages) {
    let path
    try {
      path = require.resolve(Path.join(pkg, 'plugins', `${name}.cjs`), {
        paths: [projectDir],
      })
    } catch (error) {
      continue
    }
    plugins[pkg] = require(path)
  }
  return sortPlugins(plugins)
}

module.exports = getPlugins

const path = require('path')
const { toolchainConfig, projectDir } = require('./findUps.cjs')
const { Minimatch } = require('minimatch')

const matchers = ((toolchainConfig && toolchainConfig.buildIgnore) || []).map(
  (pattern) => new Minimatch(pattern)
)

module.exports = function isBuildIgnored(file) {
  if (path.isAbsolute(file)) file = path.relative(projectDir, file)
  return matchers.some((m) => m.match(file))
}

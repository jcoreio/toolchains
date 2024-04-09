const {
  projectDir,
  packageJson,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const semver = require('semver')

module.exports = [
  () => {
    const { dependencies = {}, devDependencies = {} } = packageJson
    if (
      semver.satisfies('4.9999.9999', dependencies.chai || devDependencies.chai)
    ) {
      const chai = require(require.resolve('chai', { paths: [projectDir] }))
      chai.config.includeStack = true
    }
  },
]

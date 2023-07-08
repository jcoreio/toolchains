const {
  projectDir,
  packageJson,
} = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  () => {
    const { devDependencies } = packageJson
    if (devDependencies['global-jsdom']) {
      require(require.resolve('global-jsdom/register', { paths: [projectDir] }))
    }
  },
]

const {
  projectDir,
  packageJson,
} = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  () => {
    const { devDependencies } = packageJson
    require(devDependencies && devDependencies['global-jsdom']
      ? require.resolve('global-jsdom/register', { paths: [projectDir] })
      : 'global-jsdom/register')
  },
]

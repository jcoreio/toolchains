const getPlugins = require('../util/getPlugins.cjs')
const getPluginsAsyncFunction = require('../util/getPluginsAsyncFunction.cjs')

exports.run = async function (args = []) {
  if (!getPlugins('test').length) {
    throw new Error(
      'missing test toolchain, install @jcoreio/toolchain-mocha (there may be alternatives in the future)'
    )
  }
  await getPluginsAsyncFunction('test')(args)
}
exports.description = 'run tests'

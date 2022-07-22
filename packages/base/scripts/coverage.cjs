const getPluginsAsyncFunction = require('../util/getPluginsAsyncFunction.cjs')

exports.run = async function (args = []) {
  await getPluginsAsyncFunction('coverage')(args)
}
exports.description = 'run tests with code coverage'

const getPluginsAsyncFunction = require('../util/getPluginsAsyncFunction.cjs')

exports.run = async function (args = []) {
  await getPluginsAsyncFunction('test')(args)
}
exports.description = 'run tests'

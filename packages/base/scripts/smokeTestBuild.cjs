const getPluginsAsyncFunction = require('../util/getPluginsAsyncFunction.cjs')

exports.run = async function smokeTestBuild(args) {
  await getPluginsAsyncFunction('smokeTestBuild')(args)
}

exports.description = 'smoke test that build output can be required/imported'

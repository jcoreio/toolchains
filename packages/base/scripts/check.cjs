const getPluginsAsyncFunction = require('../util/getPluginsAsyncFunction.cjs')

exports.run = async function check(args = []) {
  await require('../scripts/runPrettier.cjs').prettierCheck(args)
  await require('../scripts/runEslint.cjs').eslintCheck(args)
  await getPluginsAsyncFunction('check')(args)
}
exports.description = 'check files with prettier and eslint'

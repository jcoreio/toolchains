exports.run = async function (args = []) {
  await require('./runEslint.cjs').eslintCheck(args)
}
exports.description = 'check files with eslint'

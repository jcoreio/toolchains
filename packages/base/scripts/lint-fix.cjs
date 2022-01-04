exports.run = async function (args = []) {
  await require('./runEslint.cjs').eslintFix(args)
}
exports.description = 'autofix eslint errors'

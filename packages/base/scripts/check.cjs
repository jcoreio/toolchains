exports.run = async function check(args = []) {
  await require('../scripts/runPrettier.cjs').prettierCheck(args)
  await require('../scripts/runEslint.cjs').eslintCheck(args)
}
exports.description = 'check files with prettier and eslint'

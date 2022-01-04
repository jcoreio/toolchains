exports.run = async function (args = []) {
  await require('./runPrettier.cjs').prettierFormat(args)
}
exports.description = 'format files with prettier'

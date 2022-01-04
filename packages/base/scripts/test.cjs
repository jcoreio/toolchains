const execa = require('../util/execa.cjs')

exports.run = async function (args = []) {
  let command = 'mocha'
  if (args.indexOf('--watch') < 0) {
    command = 'nyc'
    args.unshift('mocha')
  }
  await execa(command, args)
}
exports.description = 'run tests'

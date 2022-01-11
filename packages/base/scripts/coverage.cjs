const execa = require('../util/execa.cjs')

exports.run = async function (args = []) {
  await execa('nyc', ['mocha', ...args])
}
exports.description = 'run tests with code coverage'

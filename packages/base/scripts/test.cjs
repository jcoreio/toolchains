const execa = require('../util/execa.cjs')

exports.run = async function (args = []) {
  await execa('mocha', [...args])
}
exports.description = 'run tests'

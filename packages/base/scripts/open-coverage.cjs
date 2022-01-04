const execa = require('../util/execa.cjs')
const Path = require('path')

exports.run = async () => {
  await execa('open', [Path.join('coverage', 'lcov-report', 'index.html')])
}
exports.description = 'open code coverage report'

const check = require('./check.cjs')
const coverage = require('./coverage.cjs')
const build = require('./build.cjs')

exports.run = async function (args = []) {
  await check.run()
  await coverage.run()
  await build.run()
}

exports.description = 'run check, coverage, and build'

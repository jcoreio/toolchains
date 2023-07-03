const check = require('./check.cjs')
const build = require('./build.cjs')
const scripts = require('./toolchain.cjs')

exports.run = async function (args = []) {
  await check.run()
  if (scripts.coverage) await scripts.coverage.run()
  await build.run()
}

exports.description = 'run check, coverage, and build'

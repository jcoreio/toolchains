const execa = require('../util/execa.cjs')

exports.run = async function (args = []) {
  const { scripts } = require('./toolchain.cjs')
  await execa('tc', ['check'])
  if (scripts.coverage) await execa('tc', ['coverage'])
  await execa('tc', ['build'])
}

exports.description = 'run check, coverage, and build'

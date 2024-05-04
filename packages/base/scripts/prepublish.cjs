const execa = require('../util/execa.cjs')
const { isMonorepoRoot, packageJson } = require('../util/findUps.cjs')

exports.run = async function (args = []) {
  if (isMonorepoRoot && packageJson.name !== '@jcoreio/toolchains') {
    await execa('pnpm', ['run', '-r', 'prepublish'])
  } else {
    const { scripts } = require('./toolchain.cjs')
    await execa('tc', ['check'])
    if (scripts.coverage) await execa('tc', ['coverage'])
    if (scripts['test:esm']) await execa('tc', ['test:esm'])
    await execa('tc', ['build'])
    await execa('tc', ['build:smoke-test'])
  }
}

exports.description = 'run check, coverage, and build'

const getPluginsAsyncFunction = require('../util/getPluginsAsyncFunction.cjs')
const {
  packageJson: { devDependencies = {} },
} = require('../util/findUps.cjs')
const execa = require('../util/execa.cjs')
const fs = require('../util/projectFs.cjs')

exports.run = async function check(args = []) {
  await require('../scripts/runPrettier.cjs').prettierCheck(args)
  await require('../scripts/runEslint.cjs').eslintCheck(args)
  if (devDependencies['flow-bin'] && (await fs.pathExists('.flowconfig'))) {
    await execa('flow')
  }
  if (devDependencies['typescript'] && (await fs.pathExists('tsconfig.json'))) {
    await execa('tsc', ['--noEmit'])
  }
  await getPluginsAsyncFunction('check')(args)
}
exports.description = 'check format, types (if applicable), and lint'
#!/usr/bin/env node

const { packageJson } = require('../util/findUps.cjs')
const preinstall = require('./preinstall.cjs')
const execa = require('../util/execa.cjs')
const hasTSFiles = require('../util/hasTSFiles.cjs')

async function init(args = []) {
  const { dependencies = {}, devDependencies = {} } = packageJson
  const toolchains = []
  const isBabel =
    devDependencies['@babel/core'] != null ||
    devDependencies['babel-core'] != null ||
    devDependencies['@jcoreio/toolchain-esnext'] != null
  const isTS = await hasTSFiles()
  const isFlow = isBabel && devDependencies['flow-bin'] != null
  const isReact = dependencies.react != null || devDependencies.react != null
  const isMocha = devDependencies['mocha'] != null
  const isCircle = true // might be false someday

  if (isMocha) toolchains.push('@jcoreio/toolchain-mocha')
  if (isBabel) toolchains.push('@jcoreio/toolchain-esnext')
  if (isFlow) toolchains.push('@jcoreio/toolchain-flow')
  if (isTS) toolchains.push('@jcoreio/toolchain-typescript')
  if (isReact) toolchains.push('@jcoreio/toolchain-react')
  if (isCircle) toolchains.push('@jcoreio/toolchain-circle')

  const isTest = Boolean(process.env.JCOREIO_TOOLCHAIN_TEST)

  await preinstall.run()
  await execa('pnpm', [
    'add',
    '-D',
    isTest ? '../packages/base' : '@jcoreio/toolchain',
    ...(isTest
      ? toolchains.map((t) => t.replace(/@jcoreio\/toolchain-/, '../packages/'))
      : toolchains),
  ])
  await execa('tc', ['bootstrap'])
  await execa('pnpm', ['i', '--no-frozen-lockfile'])
  await execa('tc', ['format'])
  await execa('tc', ['lint:fix'])
  await execa('tc', ['prepublish'])
}

exports.description =
  'install toolchains, bootstrap, format, lint:fix and prepublish'
exports.run = init

if (require.main === module) {
  init().then(
    () => process.exit(0),
    (error) => {
      // eslint-disable-next-line no-console
      console.error(error.stack)
      process.exit(error.exitCode != null ? error.exitCode : 1)
    }
  )
}

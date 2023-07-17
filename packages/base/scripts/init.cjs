#!/usr/bin/env node

const { packageJson } = require('../util/findUps.cjs')
const fs = require('../util/projectFs.cjs')
const preinstall = require('./preinstall.cjs')
const execa = require('../util/execa.cjs')
const hasTSFiles = require('../util/hasTSFiles.cjs')

async function init(args = []) {
  const { version, dependencies = {}, devDependencies = {} } = packageJson
  const toolchains = new Set(
    Object.keys(devDependencies).filter((dep) =>
      dep.startsWith('@jcoreio/toolchain-')
    )
  )
  const isBabel =
    devDependencies['@babel/core'] != null ||
    devDependencies['babel-core'] != null ||
    devDependencies['@jcoreio/toolchain-esnext'] != null
  const isTS = await hasTSFiles()
  const isFlow = isBabel && devDependencies['flow-bin'] != null
  const isReact = dependencies.react != null || devDependencies.react != null
  const isMocha = devDependencies['mocha'] != null
  const isCircle = true // might be false someday
  const isSemanticRelease =
    devDependencies['semantic-release'] != null ||
    (await fs.pathExists('release.config.cjs'))

  if (isMocha) toolchains.add('@jcoreio/toolchain-mocha')
  if (isBabel) toolchains.add('@jcoreio/toolchain-esnext')
  if (isFlow) toolchains.add('@jcoreio/toolchain-flow')
  if (isTS) toolchains.add('@jcoreio/toolchain-typescript')
  if (isReact) toolchains.add('@jcoreio/toolchain-react')
  if (isCircle) toolchains.add('@jcoreio/toolchain-circle')
  if (isSemanticRelease) toolchains.add('@jcoreio/toolchain-semantic-release')

  const isTest = Boolean(process.env.JCOREIO_TOOLCHAIN_TEST)

  await preinstall.run()
  await execa('pnpm', [
    'add',
    '-D',
    isTest ? '../packages/base' : `@jcoreio/toolchain@^${version}`,
    ...(isTest
      ? [...toolchains].map((t) =>
          t.replace(/@jcoreio\/toolchain-/, '../packages/')
        )
      : [...toolchains].map((t) => `${t}@^${version}`)),
  ])
  await execa('tc', ['migrate'])
}

exports.description = 'install toolchains and migrate'
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

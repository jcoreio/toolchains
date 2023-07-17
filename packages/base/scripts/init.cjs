#!/usr/bin/env node

const { packageJson } = require('../util/findUps.cjs')
const fs = require('../util/projectFs.cjs')
const preinstall = require('./preinstall.cjs')
const execa = require('../util/execa.cjs')
const hasTSFiles = require('../util/hasTSFiles.cjs')
const { name, version } = require('../package.json')

async function init(args = []) {
  const { dependencies = {}, devDependencies = {} } = packageJson
  const toolchains = new Set(
    Object.keys(devDependencies).filter((dep) => dep.startsWith(`${name}-`))
  )
  const isBabel =
    devDependencies['@babel/core'] != null ||
    devDependencies['babel-core'] != null ||
    devDependencies[`${name}-esnext`] != null
  const isTS = await hasTSFiles()
  const isFlow = isBabel && devDependencies['flow-bin'] != null
  const isReact = dependencies.react != null || devDependencies.react != null
  const isMocha = devDependencies['mocha'] != null
  const isCircle = true // might be false someday
  const isSemanticRelease =
    devDependencies['semantic-release'] != null ||
    (await fs.pathExists('release.config.cjs'))

  if (isMocha) toolchains.add(`${name}-mocha`)
  if (isBabel) toolchains.add(`${name}-esnext`)
  if (isFlow) toolchains.add(`${name}-flow`)
  if (isTS) toolchains.add(`${name}-typescript`)
  if (isReact) toolchains.add(`${name}-react`)
  if (isCircle) toolchains.add(`${name}-circle`)
  if (isSemanticRelease) toolchains.add(`${name}-semantic-release`)

  const isTest = Boolean(process.env.JCOREIO_TOOLCHAIN_TEST)

  await preinstall.run()
  await execa('pnpm', [
    'add',
    '-D',
    isTest ? '../packages/base' : `${name}@^${version}`,
    ...(isTest
      ? [...toolchains].map((t) => t.replace(`${name}-`, '../packages/'))
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

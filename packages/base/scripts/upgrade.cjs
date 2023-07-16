#!/usr/bin/env node

const { packageJson } = require('../util/findUps.cjs')
const execa = require('../util/execa.cjs')

async function upgrade([version] = []) {
  const { devDependencies = {} } = packageJson
  const toolchains = Object.keys(devDependencies).filter((pkg) =>
    pkg.startsWith('@jcoreio/toolchain-')
  )
  const isTest = Boolean(process.env.JCOREIO_TOOLCHAIN_TEST)

  if (!isTest && !version) {
    version = (
      await execa('npm', ['view', '@jcoreio/toolchain', 'version'], {
        stdio: 'pipe',
      })
    ).stdout.trim()
  }

  await execa('pnpm', [
    'add',
    '-D',
    isTest ? '../packages/base' : `@jcoreio/toolchain@^${version}`,
    ...(isTest
      ? toolchains.map((t) => t.replace(/@jcoreio\/toolchain-/, '../packages/'))
      : toolchains.map((t) => `${t}@^${version}`)),
  ])
  await execa('tc', ['migrate'])
}

exports.description = 'upgrade toolchains and migrate'
exports.run = upgrade

if (require.main === module) {
  upgrade().then(
    () => process.exit(0),
    (error) => {
      // eslint-disable-next-line no-console
      console.error(error.stack)
      process.exit(error.exitCode != null ? error.exitCode : 1)
    }
  )
}

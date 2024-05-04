#!/usr/bin/env node

const { packageJson, monorepoProjectDir } = require('../util/findUps.cjs')
const execa = require('../util/execa.cjs')
const { name } = require('../package.json')

async function upgrade([version] = []) {
  const { devDependencies = {} } = packageJson
  const toolchains = Object.keys(devDependencies).filter((pkg) =>
    pkg.startsWith(`${name}-`)
  )
  const isTest = Boolean(process.env.JCOREIO_TOOLCHAIN_SELF_TEST)

  if (!isTest && !version) {
    version = (
      await execa('npm', ['view', name, 'version'], {
        stdio: 'pipe',
      })
    ).stdout.trim()
  }

  await execa(
    'pnpm',
    isTest
      ? [
          ...(monorepoProjectDir ? ['-r'] : []),
          'add',
          '-D',
          '--prefer-offline',
          '../packages/base',
          ...toolchains.map((t) => t.replace(`${name}-`, '../packages/')),
        ]
      : [
          ...(monorepoProjectDir ? ['-r'] : []),
          'update',
          '--prefer-offline',
          `${name}@^${version}`,
          toolchains.map((t) => `${t}@^${version}`),
        ]
  )
  if (monorepoProjectDir) await execa('pnpm', ['-r', 'run', 'tc', 'migrate'])
  else await execa('tc', ['migrate'])
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

#!/usr/bin/env node

const fs = require('../util/projectFs.cjs')

async function preinstall(args = []) {
  const preinstallUpdateProjectPackageJson = require('./preinstall/preinstallUpdateProjectPackageJson.cjs')
  const execa = require('../util/execa.cjs')
  const hasYarnOrNpmLockfile = require('../util/hasYarnOrNpmLockfile.cjs')
  const { toolchainManaged } = require('../util/findUps.cjs')
  const semver = require('semver')

  if (await hasYarnOrNpmLockfile()) {
    const packageJson = await fs.readJson('package.json')
    if (
      !packageJson.packageManager ||
      !packageJson.packageManager.startsWith('pnpm@') ||
      semver.lt(
        packageJson.packageManager.replace(/^pnpm@/, ''),
        toolchainManaged.packageManager.replace(/^pnpm@/, '')
      )
    ) {
      packageJson.packageManager = toolchainManaged.packageManager
      await fs.writeJson('package.json', packageJson, { spaces: 2 })
      // eslint-disable-next-line no-console
      console.error('updated package.json')
    }
    await execa('pnpm', ['import'])
  }
  await Promise.all(
    require('./preinstall/preinstallRemoveFiles.cjs').map(async (file) => {
      const exists = await fs.pathExists(file)
      if (exists) {
        await fs.remove(file)
        // eslint-disable-next-line no-console
        console.error('removed', file)
      }
    })
  )

  await preinstallUpdateProjectPackageJson()
}

exports.description =
  'run this script before installing toolchains in a project'
exports.run = preinstall

if (require.main === module) {
  preinstall().then(
    () => process.exit(0),
    (error) => {
      // eslint-disable-next-line no-console
      console.error(error.stack)
      process.exit(error.exitCode != null ? error.exitCode : 1)
    }
  )
}

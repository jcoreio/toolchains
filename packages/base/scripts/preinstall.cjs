#!/usr/bin/env node

const fs = require('../util/projectFs.cjs')

async function preinstall(args = []) {
  const preinstallUpdateProjectPackageJson = require('./preinstall/preinstallUpdateProjectPackageJson.cjs')
  const execa = require('../util/execa.cjs')
  const hasYarnOrNpmLockfile = require('../util/hasYarnOrNpmLockfile.cjs')

  if (await hasYarnOrNpmLockfile()) {
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

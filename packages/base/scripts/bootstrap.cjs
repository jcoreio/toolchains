#!/usr/bin/env node

const fs = require('../util/projectFs.cjs')

async function bootstrap(args = []) {
  const execa = require('../util/execa.cjs')
  const installGitHooks = require('./bootstrap/installGitHooks.cjs')
  const bootstrapProjectPackageJson = require('./bootstrap/bootstrapProjectPackageJson.cjs')
  const bootstrapConfigFiles = require('./bootstrap/bootstrapConfigFiles.cjs')
  const bootstrapGitignore = require('./bootstrap/bootstrapGitignore.cjs')
  const bootstrapRemoveFiles = require('./bootstrap/bootstrapRemoveFiles.cjs')

  await execa('git', ['init'])
  await installGitHooks()
  await bootstrapProjectPackageJson()
  await bootstrapConfigFiles()
  await bootstrapGitignore()
  await Promise.all(
    bootstrapRemoveFiles.map(async (file) => {
      const exists = await fs.pathExists(file)
      if (exists) {
        await fs.remove(file)
        // eslint-disable-next-line no-console
        console.error('removed', file)
      }
    })
  )
}

exports.description = 'set up project'
exports.run = bootstrap

if (require.main === module) {
  bootstrap().then(
    () => process.exit(0),
    (error) => {
      // eslint-disable-next-line no-console
      console.error(error.stack)
      process.exit(error.exitCode != null ? error.exitCode : 1)
    }
  )
}

#!/usr/bin/env node

async function bootstrap(args = []) {
  const execa = require('../util/execa.cjs')
  const installGitHooks = require('./bootstrap/installGitHooks.cjs')
  const bootstrapProjectPackageJson = require('./bootstrap/bootstrapProjectPackageJson.cjs')
  const bootstrapConfigFiles = require('./bootstrap/bootstrapConfigFiles.cjs')
  const bootstrapGitignore = require('./bootstrap/bootstrapGitignore.cjs')

  await execa('git', ['init'])
  await installGitHooks()
  await bootstrapProjectPackageJson()
  await bootstrapConfigFiles()
  await bootstrapGitignore()
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

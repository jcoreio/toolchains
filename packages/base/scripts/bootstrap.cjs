#!/usr/bin/env node

const fs = require('../util/projectFs.cjs')
const getPluginsAsyncFunction = require('../util/getPluginsAsyncFunction.cjs')

async function bootstrap(args = []) {
  const execa = require('../util/execa.cjs')
  const installGitHooks = require('./install-git-hooks.cjs')
  const bootstrapProjectPackageJson = require('./bootstrap/bootstrapProjectPackageJson.cjs')
  const bootstrapEslintConfigs = require('./bootstrap/bootstrapEslintConfigs.cjs')
  const bootstrapConfigFiles = require('./bootstrap/bootstrapConfigFiles.cjs')
  const bootstrapMoveTypeDefs = require('./bootstrap/bootstrapMoveTypeDefs.cjs')
  const bootstrapGitignore = require('./bootstrap/bootstrapGitignore.cjs')
  const bootstrapRemoveFiles = require('./bootstrap/bootstrapRemoveFiles.cjs')
  const hasYarnOrNpmLockfile = require('../util/hasYarnOrNpmLockfile.cjs')

  await execa('git', ['init'])
  await installGitHooks.run()
  await bootstrapProjectPackageJson()
  if (await hasYarnOrNpmLockfile()) {
    await execa('pnpm', ['import'])
  }
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
  await bootstrapConfigFiles()
  await bootstrapEslintConfigs()
  await bootstrapMoveTypeDefs()
  await bootstrapGitignore()
  await getPluginsAsyncFunction('bootstrap')(args)
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

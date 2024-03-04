#!/usr/bin/env node

const getPluginsAsyncFunction = require('../util/getPluginsAsyncFunction.cjs')

async function migrate(args = []) {
  const execa = require('../util/execa.cjs')
  const installGitHooks = require('./install-git-hooks.cjs')
  const migrateProjectPackageJson = require('./migrate/migrateProjectPackageJson.cjs')
  const migrateEslintConfigs = require('./migrate/migrateEslintConfigs.cjs')
  const migrateConfigFiles = require('./migrate/migrateConfigFiles.cjs')
  const migrateMoveTypeDefs = require('./migrate/migrateMoveTypeDefs.cjs')
  const migrateGitignore = require('./migrate/migrateGitignore.cjs')
  const hasYarnOrNpmLockfile = require('../util/hasYarnOrNpmLockfile.cjs')

  await execa('git', ['init'])
  await installGitHooks.run()
  await migrateProjectPackageJson()
  if (await hasYarnOrNpmLockfile()) {
    await execa('pnpm', ['import'])
  }
  await migrateConfigFiles()
  await migrateEslintConfigs()
  await migrateMoveTypeDefs()
  await migrateGitignore()
  await getPluginsAsyncFunction('migrate')(args)

  if (!args.includes('--config-only')) {
    await execa('pnpm', ['i', '--no-frozen-lockfile'])
    await execa('tc', ['lint:fix'])
    await execa('tc', ['format'])
  }
}

exports.description =
  'update dependencies and config, fix lint errors and format'
exports.run = migrate

if (require.main === module) {
  migrate().then(
    () => process.exit(0),
    (error) => {
      // eslint-disable-next-line no-console
      console.error(error.stack)
      process.exit(error.exitCode != null ? error.exitCode : 1)
    }
  )
}

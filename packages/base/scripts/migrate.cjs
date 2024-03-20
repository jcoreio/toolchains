#!/usr/bin/env node

const { packageJson } = require('../util/findUps.cjs')
const { name } = require('../package.json')
const getPluginsAsyncFunction = require('../util/getPluginsAsyncFunction.cjs')

async function migrate(args = []) {
  const execa = require('../util/execa.cjs')
  const {
    findGitDir,
    isMonorepoSubpackage,
    isMonorepoRoot,
  } = require('../util/findUps.cjs')
  const installGitHooks = require('./install-git-hooks.cjs')
  const migrateProjectPackageJson = require('./migrate/migrateProjectPackageJson.cjs')
  const migrateEslintConfigs = require('./migrate/migrateEslintConfigs.cjs')
  const migrateConfigFiles = require('./migrate/migrateConfigFiles.cjs')
  const migrateMoveTypeDefs = require('./migrate/migrateMoveTypeDefs.cjs')
  const migrateGitignore = require('./migrate/migrateGitignore.cjs')
  const hasYarnOrNpmLockfile = require('../util/hasYarnOrNpmLockfile.cjs')
  const writeMigratedVersion = require('../util/writeMigratedVersion.cjs')

  const fromVersion = packageJson[name]
    ? packageJson[name].migratedVersion
    : undefined
  if (!fromVersion && !isMonorepoSubpackage && !findGitDir()) {
    await execa('git', ['init'])
    await installGitHooks.run()
  }
  await migrateProjectPackageJson({ fromVersion })
  if (await hasYarnOrNpmLockfile()) {
    await execa('pnpm', ['import'])
  }
  await migrateConfigFiles({ fromVersion })
  await migrateEslintConfigs({ fromVersion })
  if (!fromVersion) await migrateMoveTypeDefs()
  await migrateGitignore({ fromVersion })
  await getPluginsAsyncFunction('migrate')(args, { fromVersion })

  await writeMigratedVersion()

  if (!args.includes('--config-only')) {
    await execa('pnpm', [
      'i',
      '--prefer-offline',
      '--fix-lockfile',
      ...(isMonorepoRoot ? ['-w'] : []),
    ])
    await execa('tc', ['format'])
    await execa('tc', ['lint:fix'])
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

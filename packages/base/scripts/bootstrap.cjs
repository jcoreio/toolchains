#!/usr/bin/env node

const fs = require('../util/projectFs.cjs')

async function bootstrap(args = []) {
  const hard = args.includes('--hard')

  const execa = require('../util/execa.cjs')
  const installGitHooks = require('./bootstrap/install-git-hooks.cjs')
  const updateProjectPackageJson = require('./bootstrap/updateProjectPackageJson.cjs')
  const writeConfigFiles = require('./bootstrap/writeConfigFiles.cjs')
  const updateGitignore = require('./bootstrap/updateGitignore.cjs')

  if (hard) {
    await Promise.all(
      require('./bootstrap/removeFiles.cjs').map((file) => fs.remove(file))
    )
  }

  await execa('git', ['init'])
  await installGitHooks()
  await updateProjectPackageJson({ hard })
  await writeConfigFiles({ hard })
  await updateGitignore()
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

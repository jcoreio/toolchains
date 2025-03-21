const { glob } = require('glob')
const path = require('path')
const fs = require('fs-extra')
const execa = require('@jcoreio/toolchain/util/execa.cjs')

/* eslint-env node, es2018 */
module.exports = {
  ...require('@jcoreio/toolchain/githooks.cjs'),
  'pre-commit': async (...args) => {
    const gitDirs = await glob(
      path.resolve(__dirname, 'fixtures', '**', '.git')
    )
    await Promise.all(gitDirs.map((dir) => fs.remove(dir)))
    await execa('lint-staged', args)

    const pnpmVersion = (
      await execa('pnpm', ['-v'], { stdio: 'pipe', maxBuffer: 10 * 1024 })
    ).stdout
    const projectFs = require('@jcoreio/toolchain/util/projectFs.cjs')
    const { packageManager } = await projectFs.readJson('package.json')
    const expectedPnpmVersion = packageManager.replace(/^pnpm@/, '')
    if (pnpmVersion !== expectedPnpmVersion) {
      const chalk = require('chalk')
      // eslint-disable-next-line no-console
      console.error(
        chalk`{red Error: the pnpm on your $PATH is version ${pnpmVersion}, but your package.json has "packageManager": ${JSON.stringify(packageManager)}.
This may mean your pnpm-lock.yaml is the wrong version, which would cause installing dependencies in CI to fail.
It's recommended to use corepack (https://nodejs.org/api/corepack.html) to manage pnpm instead of installing it globally,
since corepack can automatically select the pnpm version specified in "packageManager"}`
      )
      process.exit(1)
    }
  },
}

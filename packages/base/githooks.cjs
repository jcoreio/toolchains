module.exports = {
  'pre-commit': async (...args) => {
    const execa = require('./util/execa.cjs')
    await execa('lint-staged', args)

    const pnpmVersion = (
      await execa('pnpm', ['-v'], { stdio: 'pipe', maxBuffer: 10 * 1024 })
    ).stdout
    const projectFs = require('./util/projectFs.cjs')
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
  'commit-msg': async (file) => {
    const fs = require('./util/projectFs.cjs')
    const parseCommitMessage = require('./util/parseCommitMessage.cjs')
    const chalk = require('chalk')
    const { monorepoSubpackageJsons } = require('./util/findUps.cjs')

    let content
    try {
      content = await fs.readFile(file, 'utf8')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        chalk`{red ✖} failed to read commit message from ${file}`,
        error.message
      )
      process.exit(1)
    }
    try {
      const parsed = parseCommitMessage(content)
      if (!parsed.merge) {
        const scope = parsed.scope && parsed.scope[0]
        if (
          scope &&
          monorepoSubpackageJsons &&
          !monorepoSubpackageJsons.some((j) => scope === j.name)
        ) {
          throw new Error(
            `invalid scope: ${scope} - scope must be the name of a package in this monorepo`
          )
        }
      }
      // eslint-disable-next-line no-console
      console.error(chalk`{green ✔} validated commit message`)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(chalk`{red ✖} invalid commit message: ${error.message}`)
      process.exit(1)
      return
    }
  },
}

module.exports = {
  'pre-commit': 'lint-staged',
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

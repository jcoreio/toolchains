const Path = require('path')
const { findGitDir } = require('../util/findUps.cjs')
const execa = require('../util/execa.cjs')

module.exports = async function runHook(hook) {
  try {
    const gitDir = findGitDir()
    if (!gitDir) {
      throw new Error(`failed to find .git directory`)
    }

    const projDir = Path.dirname(gitDir)
    let hooks
    try {
      hooks = require(Path.join(projDir, 'githooks.cjs'))
    } catch (error) {
      hooks = require('../githooks.cjs')
    }

    if (hooks[hook]) {
      await execa(hooks[hook], {
        cwd: projDir,
        shell: true,
      })
    }
  } catch (error) {
    const { exitCode } = error
    process.exit(exitCode != null ? exitCode : 1)
    return
  }
  process.exit(0)
}

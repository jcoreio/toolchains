const fs = require('fs-extra')
const Path = require('path')

async function findGitDir() {
  let path = __dirname
  while (path && path !== '/') {
    try {
      const dir = Path.join(path, '.git')
      if ((await fs.stat(dir)).isDirectory()) {
        return dir
      }
    } catch (error) {
      // ignore
    }
    const parent = Path.dirname(path)
    if (parent === path) break
    path = parent
  }
}

module.exports = async function runHook(hook) {
  const gitDir = await findGitDir()
  if (!gitDir) {
    throw new Error(`failed to find .git directory`)
  }

  const projDir = Path.dirname(gitDir)
  let hooks
  try {
    hooks = require(Path.join(projDir, '.githooks.cjs'))
  } catch (error) {
    hooks = require('../githooks.cjs')
  }

  if (hooks[hook]) {
    const execa = require('execa')
    await execa(hooks[hook], {
      cwd: projDir,
      shell: true,
      stdio: 'inherit',
    })
  }
}

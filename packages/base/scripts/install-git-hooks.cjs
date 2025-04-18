#!/usr/bin/env node

const execa = require('../util/execa.cjs')
const Path = require('path')
const dedent = require('dedent-js')
const { findGitDir, projectDir } = require('../util/findUps.cjs')
const fs = require('fs-extra')
const { name } = require('../package.json')

async function installGitHooks() {
  const gitDir = findGitDir()
  if (!gitDir) {
    // eslint-disable-next-line no-console
    console.warn(dedent`
      .git directory not found!
      git hooks could not be installed.
      after you run \`git init\`, try \`pnpm tc install-git-hooks\`.
    `)
  } else {
    const symlinkPath = Path.join('node_modules', name, 'githooks')
    const githooksDir =
      (await fs.pathExists(Path.resolve(projectDir, symlinkPath))) ?
        symlinkPath
      : Path.resolve(__dirname, '..', 'githooks')

    // chmod in case pnpm doesn't preserve mode of hooks scripts
    await Promise.all(
      (await fs.readdir(githooksDir)).map((hook) =>
        fs.chmod(Path.join(githooksDir, hook), 0o755)
      )
    )
    await execa('git', [
      'config',
      'core.hooksPath',
      Path.relative(Path.dirname(gitDir), githooksDir),
    ])
    // eslint-disable-next-line no-console
    console.log('successfully installed git hooks!')
  }
}

exports.description = 'install git hooks'

exports.run = installGitHooks

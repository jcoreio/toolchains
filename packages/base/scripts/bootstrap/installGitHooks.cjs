#!/usr/bin/env node

const execa = require('../../util/execa.cjs')
const Path = require('path')
const dedent = require('dedent-js')
const { findGitDir } = require('../../util/findUps.cjs')

async function installGitHooks() {
  const gitDir = findGitDir()
  if (!gitDir) {
    // eslint-disable-next-line no-console
    console.warn(dedent`
      .git directory not found!
      git hooks could not be installed.
      after you run \`git init\`, try \`pnpm exec install-git-hooks\`.
    `)
  } else {
    await execa('git', [
      'config',
      'core.hooksPath',
      Path.relative(
        Path.dirname(gitDir),
        Path.resolve(__dirname, '..', '..', 'githooks')
      ),
    ])
    // eslint-disable-next-line no-console
    console.log('successfully installed git hooks!')
  }
}

module.exports = installGitHooks

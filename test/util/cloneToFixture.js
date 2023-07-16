#!/usr/bin/env node

const execa = require('execa')
const fs = require('fs-extra')
const Path = require('path')
const fixtures = Path.resolve(__dirname, '..', '..', 'fixtures')

async function cloneToFixture(repo, inputDir = 'input') {
  await fs.mkdirs(Path.join(fixtures, Path.basename(repo)))
  await execa(
    'git',
    [
      'clone',
      `https://github.com/${repo}.git`,
      Path.join(fixtures, Path.basename(repo), inputDir),
    ],
    { stdio: 'inherit' }
  )
  await fs.remove(Path.join(fixtures, Path.basename(repo), inputDir, '.git'))
}

module.exports = cloneToFixture

if (require.main === module) {
  const [, , name, inputDir] = process.argv
  if (!name) {
    // eslint-disable-next-line no-console
    console.error(
      `Usage: ${process.argv.slice(0, 2).join(' ')} <repo> [input-dir]`
    )
    process.exit(1)
  }
  cloneToFixture(name, inputDir)
}

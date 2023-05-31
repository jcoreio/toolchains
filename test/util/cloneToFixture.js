#!/usr/bin/env node

const execa = require('execa')
const fs = require('fs-extra')
const Path = require('path')
const fixtures = Path.resolve(__dirname, '..', '..', 'fixtures')

async function cloneToFixture(repo) {
  await fs.mkdirs(Path.join(fixtures, Path.basename(repo)))
  await execa(
    'git',
    [
      'clone',
      `https://github.com/${repo}.git`,
      Path.join(fixtures, Path.basename(repo), 'input'),
    ],
    { stdio: 'inherit' }
  )
  await fs.remove(Path.join(fixtures, Path.basename(repo), 'input', '.git'))
}

module.exports = cloneToFixture

if (require.main === module) {
  const name = process.argv[2]
  if (!name) {
    // eslint-disable-next-line no-console
    console.error(`Usage: ${process.argv.slice(0, 2).join(' ')} <repo>`)
    process.exit(1)
  }
  cloneToFixture(name)
}

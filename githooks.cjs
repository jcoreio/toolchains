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
  },
}

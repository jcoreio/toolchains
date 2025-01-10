/**
 * @prettier
 * @flow
 */

const fs = require('fs-extra')
const Gitignore = require('gitignore-fs').default
const Path = require('path')
const { expect } = require('chai')

async function expectDirsEqual(actual, expected) {
  const gitignore = new Gitignore({
    finalRules: ['!dist', 'pnpm-lock.yaml'],
  })

  async function readdir(dir) {
    const entries = await fs.readdir(dir)
    const result = []
    await Promise.all(
      entries.map(async (entry) => {
        const path = Path.join(dir, entry)
        const stat = await fs.stat(path)
        const ignorePath = path + (stat.isDirectory() ? '/' : '')
        if (!(await gitignore.ignores(ignorePath))) {
          result.push(entry + (stat.isDirectory() ? '/' : ''))
        }
      })
    )
    return result
  }

  const actualEntries = await readdir(await fs.realpath(actual))
  const expectedEntries = await readdir(expected)
  expect(actualEntries.sort(), `contents of ${actual}`).to.have.members(
    expectedEntries
      .map((e) =>
        e
          .replace(/_\.gitignore$/, '.gitignore')
          .replace(/_lint-staged\.config\.cjs$/, 'lint-staged.config.cjs')
      )
      .sort()
  )
  for (const entry of actualEntries) {
    const actualPath = Path.join(actual, entry)
    const expectedPath = Path.join(
      expected,
      entry === '.gitignore'
        ? '_.gitignore'
        : entry === 'lint-staged.config.cjs'
        ? '_lint-staged.config.cjs'
        : entry
    )
    if (/\/$/.test(entry)) {
      await expectDirsEqual(actualPath, expectedPath)
    } else {
      expect(
        await fs.readFile(actualPath, 'utf8'),
        `contents of ${actualPath}`
      ).to.equal(await fs.readFile(expectedPath, 'utf8'))
    }
  }
}

module.exports = expectDirsEqual

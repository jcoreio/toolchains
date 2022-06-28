#!/usr/bin/env node
/* eslint-env node, es2018 */

const fs = require('fs-extra')
const Path = require('path')
const glob = require('glob')
const { promisify } = require('util')

async function go() {
  const [, , fixture, expName = 'expected-preinstall-bootstrap'] = process.argv
  const actual = Path.resolve(__dirname, 'fixtures', fixture, 'actual')
  const expected = Path.resolve(__dirname, 'fixtures', fixture, expName)
  await fs.mkdirs(expected)
  await fs.emptyDir(expected)

  const files = await promisify(glob)('{*,**/*}', {
    cwd: actual,
    dot: true,
    nodir: true,
    ignore: ['.nyc_output/**', 'coverage/**', 'node_modules/**', '.git/**'],
  })
  const dirs = new Set()
  await Promise.all(
    files.map(async f => {
      const dir = Path.dirname(f)
      if (dir && !dirs.has(dir)) {
        dirs.add(dir)
        await fs.mkdirs(dir)
      }
      await fs.copy(
        Path.join(actual, f),
        Path.join(
          expected,
          Path.basename(f) === '.gitignore'
            ? Path.join(Path.dirname(f), '_.gitignore')
            : f
        )
      )
    })
  )
}

go()

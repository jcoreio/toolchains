/**
 * @flow
 * @prettier
 */

const { describe, it } = require('mocha')
const Path = require('path')
const copyFixture = require('./util/copyFixture')
const fs = require('fs-extra')
const expectDirsEqual = require('./util/expectDirsEqual')
const execa = require('execa')

describe(`typescript/react project`, function() {
  this.timeout(120000)
  it(`preinstall && bootstrap && format && lint:fix && prepublish`, async function() {
    const linkdir = await copyFixture('react-view-slider-ts')
    const cwd = await fs.realpath(linkdir)
    await execa(
      process.execPath,
      [require.resolve('../packages/base/scripts/toolchain.cjs'), 'preinstall'],
      { cwd, stdio: 'inherit' }
    )
    await execa(
      'pnpm',
      [
        'add',
        '-D',
        '../packages/base',
        '../packages/esnext',
        '../packages/react',
        '../packages/typescript',
      ],
      {
        cwd,
        stdio: 'inherit',
      }
    )
    await execa('tc', ['bootstrap'], { cwd, stdio: 'inherit' })
    await execa('pnpm', ['i'], { cwd, stdio: 'inherit' })
    await execa('tc', ['format'], { cwd, stdio: 'inherit' })
    await execa('tc', ['lint:fix'], { cwd, stdio: 'inherit' })
    await execa('tc', ['prepublish'], { cwd, stdio: 'inherit' })
    await expectDirsEqual(
      linkdir,
      Path.resolve(linkdir, '..', 'expected-preinstall-bootstrap')
    )
  })
})

/**
 * @flow
 * @prettier
 */

const { describe, it } = require('mocha')
const Path = require('path')
const copyFixture = require('./util/copyFixture')
const expectDirsEqual = require('./util/expectDirsEqual')
const execa = require('execa')
const fs = require('fs-extra')

describe(`<typescript>`, function () {
  this.timeout(120000)
  it(`preinstall && bootstrap && format && lint:fix && prepublish`, async function () {
    const linkdir = await copyFixture('log4jcore')
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
        '../packages/flow',
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
  it(`init`, async function () {
    const linkdir = await copyFixture('log4jcore')
    const cwd = await fs.realpath(linkdir)
    await execa(
      process.execPath,
      [require.resolve('../packages/base/scripts/toolchain.cjs'), 'init'],
      {
        cwd,
        stdio: 'inherit',
        env: { ...process.env, JCOREIO_TOOLCHAIN_TEST: '1' },
      }
    )
    await expectDirsEqual(linkdir, Path.resolve(linkdir, '..', 'expected-init'))
  })
})

/**
 * @flow
 * @prettier
 */

const { describe, it } = require('mocha')
const Path = require('path')
const copyFixture = require('./util/copyFixture')
const expectDirsEqual = require('./util/expectDirsEqual')
const execa = require('execa')

describe(`@jcoreio/toolchain-esnext and @jcoreio/toolchain-typescript`, function () {
  this.timeout(60000)
  it(`preinstall && bootstrap && format && lint:fix && prepublish`, async function () {
    const cwd = await copyFixture('log4jcore')
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
        'prettier',
        '@babel/core@^7.11.0',
      ],
      {
        cwd,
        stdio: 'inherit',
      }
    )
    await execa('tc', ['bootstrap'], { cwd, stdio: 'inherit' })
    await execa('pnpm', ['add', '-D', '@babel/register'], {
      cwd,
      stdio: 'inherit',
    })
    await execa('tc', ['format'], { cwd, stdio: 'inherit' })
    await execa('tc', ['lint:fix'], { cwd, stdio: 'inherit' })
    await execa('tc', ['prepublish'], { cwd, stdio: 'inherit' })
    await expectDirsEqual(
      cwd,
      Path.resolve(cwd, '..', 'expected-preinstall-bootstrap')
    )
  })
})

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

describe(`@jcoreio/toolchain-react and @jcoreio/toolchain-flow`, function() {
  this.timeout(60000)
  it(`preinstall && bootstrap && format && lint:fix && prepublish`, async function() {
    const dirlink = await copyFixture('react-view-slider')
    const cwd = await fs.realpath(dirlink)
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
        '../packages/react',
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
      dirlink,
      Path.resolve(dirlink, '..', 'expected-preinstall-bootstrap')
    )
  })
})

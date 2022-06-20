/**
 * @flow
 * @prettier
 */

const { describe, it } = require('mocha')
const Path = require('path')
const copyFixture = require('./util/copyFixture')
const expectDirsEqual = require('./util/expectDirsEqual')
const execa = require('execa')

describe(`@jcoreio/toolchain`, function () {
  this.timeout(60000)
  it(`gut && bootstrap && format && lint:fix && prepublish`, async function () {
    const cwd = await copyFixture('find-cycle')
    await execa(
      process.execPath,
      [require.resolve('../packages/base/scripts/toolchain.cjs'), 'gut'],
      { cwd, stdio: 'inherit' }
    )
    await execa('pnpm', ['add', '-D', `@jcoreio/toolchain@workspace:*`], {
      cwd,
      stdio: 'inherit',
    })
    await execa(
      process.execPath,
      [require.resolve('../packages/base/scripts/toolchain.cjs'), 'bootstrap'],
      { cwd, stdio: 'inherit' }
    )
    await execa('pnpm', ['i'], { cwd, stdio: 'inherit' })
    await execa('tc', ['format'], { cwd, stdio: 'inherit' })
    await execa('tc', ['lint:fix'], { cwd, stdio: 'inherit' })
    await execa('tc', ['prepublish'], { cwd, stdio: 'inherit' })
    await expectDirsEqual(
      cwd,
      Path.resolve(cwd, '..', 'expected-gut-bootstrap')
    )
  })
})

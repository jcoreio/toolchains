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

describe(`<react/flow>`, function () {
  this.timeout(120000)
  it(`init`, async function () {
    const linkdir = await copyFixture('react-view-slider')
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

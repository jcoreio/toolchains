/**
 * ow
 * @prettier
 */

const { it } = require('mocha')
const Path = require('path')
const execa = require('execa')
const fs = require('fs-extra')
const copyFixture = require('../util/copyFixture')
const expectDirsEqual = require('../util/expectDirsEqual')
const updateSnapshot = require('../util/updateSnapshot')
const banner = require('../util/banner')

for (const fixture of ['async-throttle']) {
  it(`outputEsm: false with ${fixture}`, async function () {
    this.timeout(120000)
    // eslint-disable-next-line no-console
    console.error('\n' + banner(fixture + ' (outputEsm: false)') + '\n')
    const linkdir = await copyFixture(fixture, 'input-noesm')
    const execaOpts = {
      cwd: await fs.realpath(linkdir),
      stdio: 'inherit',
      env: { ...process.env, JCOREIO_TOOLCHAIN_SELF_TEST: '1' },
    }
    await execa('pnpm', ['i'], execaOpts)
    await execa('pnpm', ['tc', 'build'], execaOpts)

    if (process.env.UPDATE_SNAPSHOTS) {
      await updateSnapshot(fixture, 'noesm-snapshot')
    } else {
      await expectDirsEqual(
        linkdir,
        Path.resolve(linkdir, '..', 'noesm-snapshot')
      )
    }
  })
}

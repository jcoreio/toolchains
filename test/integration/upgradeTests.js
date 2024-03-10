/**
 * @flow
 * @prettier
 */

const { it } = require('mocha')
const Path = require('path')
const execa = require('execa')
const fs = require('fs-extra')
const copyFixture = require('../util/copyFixture')
const runUpgrade = require('../util/runUpgrade')
const expectDirsEqual = require('../util/expectDirsEqual')
const updateSnapshot = require('../util/updateSnapshot')
const banner = require('../util/banner')

for (const fixture of ['async-throttle']) {
  it(`upgrade ${fixture}`, async function () {
    this.timeout(120000)
    // eslint-disable-next-line no-console
    console.error('\n' + banner(fixture + ' (upgrade)') + '\n')
    const linkdir = await copyFixture(fixture, 'input-upgrade')
    const execaOpts = {
      cwd: await fs.realpath(linkdir),
      stdio: 'inherit',
      env: { ...process.env, JCOREIO_TOOLCHAIN_SELF_TEST: '1' },
    }
    await execa('pnpm', ['i'], execaOpts)
    await runUpgrade(linkdir)
    await execa('pnpm', ['tc', 'prepublish'], execaOpts)

    if (process.env.UPDATE_SNAPSHOTS) {
      await updateSnapshot(fixture, 'upgrade-snapshot')
    } else {
      await expectDirsEqual(
        linkdir,
        Path.resolve(linkdir, '..', 'upgrade-snapshot')
      )
    }
  })
}

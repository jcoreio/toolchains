const { it } = require('mocha')
const Path = require('path')
const execa = require('execa')
const fs = require('fs-extra')
const copyFixture = require('../util/copyFixture')
const expectDirsEqual = require('../util/expectDirsEqual')
const updateSnapshot = require('../util/updateSnapshot')
const banner = require('../util/banner')

for (const fixture of ['cli-example', 'type-module']) {
  it(`prepublish ${fixture}`, async function () {
    this.timeout(120000)
    // eslint-disable-next-line no-console
    console.error('\n' + banner(fixture) + '\n')
    const linkdir = await copyFixture(fixture)
    const execaOpts = {
      cwd: await fs.realpath(linkdir),
      stdio: 'inherit',
      env: { ...process.env, JCOREIO_TOOLCHAIN_SELF_TEST: '1' },
    }
    await execa(
      'pnpm',
      [
        'i',
        '-D',
        '--prefer-offline',
        '../packages/base',
        '../packages/esnext',
        '../packages/typescript',
        '../packages/mocha',
      ],
      execaOpts
    )
    await execa('pnpm', ['tc', 'prepublish'], execaOpts)

    if (process.env.UPDATE_SNAPSHOTS) {
      await updateSnapshot(fixture, 'prepublish-snapshot')
    } else {
      await expectDirsEqual(
        linkdir,
        Path.resolve(linkdir, '..', 'prepublish-snapshot')
      )
    }
  })
}

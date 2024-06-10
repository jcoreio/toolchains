const { it } = require('mocha')
const Path = require('path')
const execa = require('execa')
const fs = require('fs-extra')
const banner = require('../util/banner')
const copyFixture = require('../util/copyFixture')
const expectDirsEqual = require('../util/expectDirsEqual')
const updateSnapshot = require('../util/updateSnapshot')

it(`monorepo prepublish`, async function () {
  this.timeout(120000)
  // eslint-disable-next-line no-console
  console.error('\n' + banner('monorepo prepublish') + '\n')
  const linkdir = await copyFixture('monorepo')
  const execaOpts = {
    cwd: await fs.realpath(linkdir),
    stdio: 'inherit',
    env: { ...process.env, JCOREIO_TOOLCHAIN_SELF_TEST: '1' },
  }
  await execa('pnpm', ['i', '--prefer-offline'], execaOpts)
  await execa('pnpm', ['tc', 'prepublish'], execaOpts)
  if (process.env.UPDATE_SNAPSHOTS) {
    await updateSnapshot('monorepo', 'prepublish-snapshot')
  } else {
    await expectDirsEqual(
      linkdir,
      Path.resolve(linkdir, '..', 'prepublish-snapshot')
    )
  }
})

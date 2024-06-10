const { it } = require('mocha')
const execa = require('execa')
const fs = require('fs-extra')
const banner = require('../util/banner')
const copyFixture = require('../util/copyFixture')

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
})

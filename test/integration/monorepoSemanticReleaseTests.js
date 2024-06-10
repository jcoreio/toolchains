const { it } = require('mocha')
const execa = require('execa')
const fs = require('fs-extra')
const banner = require('../util/banner')
const copyFixture = require('../util/copyFixture')

it.skip(`monorepo semantic-release`, async function () {
  this.timeout(120000)
  // eslint-disable-next-line no-console
  console.error('\n' + banner('monorepo semantic-release') + '\n')
  const linkdir = await copyFixture('monorepo')
  const execaOpts = {
    cwd: await fs.realpath(linkdir),
    stdio: 'inherit',
    env: { ...process.env, JCOREIO_TOOLCHAIN_SELF_TEST: '1' },
  }
  await execa('pnpm', ['i'], execaOpts)
  // await execa('pnpm', ['tc', 'prepublish'], execaOpts)
  await execa('git', ['init'], execaOpts)
  await execa('git', ['add', '.'], execaOpts)
  await execa('git', ['commit', '-m', 'feat: initial commit'], execaOpts)
})

/**
 * @flow
 * @prettier
 */

const { it } = require('mocha')
const Path = require('path')
const execa = require('execa')
const fs = require('fs-extra')
const copyFixture = require('./util/copyFixture')
const runInit = require('./util/runInit')
const expectDirsEqual = require('./util/expectDirsEqual')
const updateSnapshot = require('./util/updateSnapshot')
const banner = require('./util/banner')

for (const fixture of [
  'async-throttle',
  'find-cycle',
  'log4jcore',
  'react-view-slider',
  'react-view-slider-ts',
]) {
  it(`init ${fixture}`, async function () {
    this.timeout(120000)
    // eslint-disable-next-line no-console
    console.error('\n' + banner(fixture) + '\n')
    const linkdir = await copyFixture(fixture)
    try {
      await runInit(linkdir)
    } catch (error) {
      if (handleInitError[fixture]) {
        await handleInitError[fixture](linkdir, error)
      } else {
        throw error
      }
    }
    if (process.env.UPDATE_SNAPSHOTS) {
      await updateSnapshot(fixture, 'init-snapshot')
    } else {
      await expectDirsEqual(
        linkdir,
        Path.resolve(linkdir, '..', 'init-snapshot')
      )
    }
  })
}

const handleInitError = {
  log4jcore: async (linkdir) => {
    const execaOpts = {
      cwd: await fs.realpath(linkdir),
      stdio: 'inherit',
    }
    await execa('pnpm', ['add', '-D', '@babel/register@^7.22.5'], execaOpts)
    await execa('pnpm', ['tc', 'prepublish'], execaOpts)
  },
}

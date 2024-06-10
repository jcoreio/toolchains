const { it } = require('mocha')
const { expect } = require('chai')
const path = require('path')
const execa = require('execa')
const fs = require('fs-extra')
const banner = require('../util/banner')
const copyFixture = require('../util/copyFixture')

it(`monorepo semantic-release`, async function () {
  this.timeout(120000)
  // eslint-disable-next-line no-console
  console.error('\n' + banner('monorepo semantic-release') + '\n')
  const linkdir = await copyFixture('monorepo')
  const execaOpts = {
    cwd: await fs.realpath(linkdir),
    stdio: 'inherit',
    env: { ...process.env, JCOREIO_TOOLCHAIN_SELF_TEST: '1' },
  }
  await execa('pnpm', ['i', '--prefer-offline'], execaOpts)
  await execa('git', ['init'], execaOpts)
  await execa(
    'git',
    [
      'remote',
      'add',
      'origin',
      'https://github.com/jcoreio/toolchain-monorepo-test.git',
    ],
    execaOpts
  )
  await execa('git', ['config', 'push.autoSetupRemote', 'true'], execaOpts)
  await execa('git', ['add', '.'], execaOpts)
  await execa(
    'git',
    [
      'commit',
      '-m',
      'feat(@jcoreio/toolchain-monorepo-test-foo): initial commit',
    ],
    execaOpts
  )
  await execa('git', ['push', '--force', 'origin', 'master'], execaOpts)

  function execaPipe(command, args, options) {
    const child = execa('pnpm', ['tc', 'release'], {
      ...options,
      stdio: 'pipe',
      encoding: 'utf8',
      maxBuffer: 30 * 1024 * 1024,
    })
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
    return child
  }

  {
    const { stdout } = await execaPipe('pnpm', ['tc', 'release'], {
      ...execaOpts,
      cwd: path.join(execaOpts.cwd, 'packages', 'foo'),
    })
    expect(stdout).to.contain(
      'Skip @jcoreio/toolchain-monorepo-test-foo-v1.0.0 tag creation'
    )
    expect(stdout).to.contain(
      '* @jcoreio/toolchain-monorepo-test-foo: initial commit'
    )
  }
  {
    const { stdout } = await execaPipe('pnpm', ['tc', 'release'], {
      ...execaOpts,
      cwd: path.join(execaOpts.cwd, 'packages', 'bar'),
    })
    expect(stdout).not.to.contain(
      'Skip @jcoreio/toolchain-monorepo-test-bar-v1.0.0 tag creation'
    )
    expect(stdout).to.contain('There are no relevant changes')
  }

  await execa(
    'git',
    ['commit', '-a', '-m', 'feat: new initial commit'],
    execaOpts
  )
  await execa('git', ['push', '--force', 'origin', 'master'], execaOpts)

  {
    for (const pkg of ['foo', 'bar']) {
      const { stdout } = await execaPipe('pnpm', ['tc', 'release'], {
        ...execaOpts,
        cwd: path.join(execaOpts.cwd, 'packages', pkg),
      })
      expect(stdout).to.contain(
        `Skip @jcoreio/toolchain-monorepo-test-${pkg}-v1.0.0 tag creation`
      )
      expect(stdout).to.contain('* new initial commit')
    }
  }
})

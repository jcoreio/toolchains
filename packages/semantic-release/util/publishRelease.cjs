const path = require('path')
const execa = require('@jcoreio/toolchain/util/execa.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const { monorepoPackageJson } = require('@jcoreio/toolchain/util/findUps.cjs')
const semver = require('semver')
const JWT = require('jsonwebtoken')

module.exports = async function publishRelease({ cwd, nextVersion, gitTag }) {
  if (!semver.valid(nextVersion)) {
    // eslint-disable-next-line no-console
    console.error('Usage: tc publish <version>')
    process.exit(1)
  }
  const packageJson = fs.readJson(path.join(cwd, 'package.json'))
  if (packageJson.private) {
    // eslint-disable-next-line no-console
    console.error(`Package ${packageJson.name} is private, skipping`)
    return
  }
  await execa('pnpm', ['version', nextVersion], { cwd })
  const env = { ...process.env }
  if (process.env.CIRCLECI === 'true') {
    env.NPM_ID_TOKEN = (
      await execa(
        'circleci',
        ['run', 'oidc', 'get', '--claims', '{"aud": "npm:registry.npmjs.org"}'],
        { stdio: ['inherit', 'pipe', 'inherit'], encoding: 'utf8' }
      )
    ).stdout.trim()
    env.NPM_TOKEN = ''
    env.npm_config_loglevel = 'silly'
    env['npm_config_//registry.npmjs.org/:_authToken'] = ''

    const decoded = JWT.decode(env.NPM_ID_TOKEN)
    // eslint-disable-next-line no-console
    console.error('NPM_ID_TOKEN token claims:', decoded)
  }
  const [npmTag] = semver.prerelease(nextVersion) || []
  try {
    await execa(
      'pnpm',
      ['publish', '.', '--no-git-checks', ...(npmTag ? ['--tag', npmTag] : [])],
      { cwd, env }
    )
  } catch {
    if (!gitTag) {
      gitTag =
        monorepoPackageJson ?
          `${packageJson.name}-v${nextVersion}`
        : `v${nextVersion}`
    }
    await execa('git', ['tag', '-d', gitTag], {
      cwd: 'dist',
      env,
    })
    let origin = 'origin'
    if (process.env.GH_TOKEN) {
      const repoUrl = new URL(
        monorepoPackageJson?.repository?.url || packageJson.repository?.url
      )
      repoUrl.username = 'x-access-token'
      repoUrl.password = process.env.GH_TOKEN
      origin = repoUrl.toString()
    }

    await execa('git', ['push', '--delete', origin, gitTag], {
      cwd,
      env,
    })
    process.exit(1)
  }
}

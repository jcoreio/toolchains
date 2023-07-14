const { projectDir } = require('@jcoreio/toolchain/util/findUps.cjs')
const execa = require('@jcoreio/toolchain/util/execa.cjs')
const path = require('path')

const hasMain =
  execa.sync('git', ['rev-parse', '--verify', 'main'], { stdio: 'pipe' })
    .exitCode === 0

module.exports = {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    hasMain ? 'main' : 'master',
    'next',
    'next-major',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
  plugins: [
    require.resolve('@semantic-release/commit-analyzer'),
    require.resolve('@semantic-release/release-notes-generator'),
    [
      require.resolve('@semantic-release/npm'),
      {
        pkgRoot: path.join(projectDir, 'dist'),
      },
    ],
    require.resolve('@semantic-release/github'),
  ],
}

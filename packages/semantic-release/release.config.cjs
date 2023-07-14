const { projectDir } = require('@jcoreio/toolchain/util/findUps.cjs')
const path = require('path')

module.exports = {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'master',
    'main',
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

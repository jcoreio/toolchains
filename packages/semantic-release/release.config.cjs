const { projectDir } = require('./util/findUps.cjs')
const path = require('path')

module.exports = {
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

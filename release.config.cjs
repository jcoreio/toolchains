/* eslint-env node, es2018 */
module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/exec',
      {
        publishCmd:
          'pnpm -r exec npm version ${nextRelease.version} && pnpm publish -r --no-git-checks',
      },
    ],
    '@semantic-release/github',
  ],
}

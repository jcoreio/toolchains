/* eslint-env node, es2018 */
process.env.JCOREIO_TOOLCHAIN_SELF_TEST = '1'
module.exports = {
  ...require('@jcoreio/toolchain-semantic-release/release.config.cjs'),
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/exec',
      {
        publishCmd:
          'pnpm -r exec npm version --no-git-tag-version ${nextRelease.version} && pnpm publish -r --no-git-checks --access public',
      },
    ],
    '@semantic-release/github',
  ],
}

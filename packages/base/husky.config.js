/* eslint-env node */

module.exports = {
  hooks: {
    'prepare-commit-msg':
      "grep -qE '^[^#]' .git/COMMIT_EDITMSG || (exec < /dev/tty && git cz --hook || true)",
    'pre-commit': `${require.resolve('./lib/toolchain.js')} pre-commit`,
    'commit-msg': `${require.resolve(
      './lib/toolchain.js'
    )} commitlint -E HUSKY_GIT_PARAMS`,
  },
}

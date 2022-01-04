module.exports = {
  'prepare-commit-msg': `grep -qE '^[^#]' .git/COMMIT_EDITMSG || (exec < /dev/tty && cz --hook || true)`,
  'pre-commit': 'lint-staged',
  'commit-msg': `commitlint -e`,
}

const resolveBin = require('resolve-bin')

module.exports = {
  'prepare-commit-msg': `grep -qE '^[^#]' .git/COMMIT_EDITMSG || (exec < /dev/tty && ${resolveBin.sync(
    'commitizen',
    { executable: 'git-cz' }
  )} --hook || true)`,
  'commit-msg': `${resolveBin.sync('@commitlint/cli', {
    executable: 'commitlint',
  })} -e`,
}

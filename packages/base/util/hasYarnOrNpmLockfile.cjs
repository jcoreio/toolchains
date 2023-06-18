const fs = require('./projectFs.cjs')

async function hasYarnOrNpmLockfile() {
  return (
    await Promise.all(
      ['yarn.lock', 'npm-shrinkwrap.json', 'package-lock.json'].map((file) =>
        fs.pathExists(file)
      )
    )
  ).some((exists) => exists)
}

module.exports = hasYarnOrNpmLockfile

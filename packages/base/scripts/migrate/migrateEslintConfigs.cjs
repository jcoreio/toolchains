const { glob } = require('../../util/glob.cjs')
const Path = require('path')
const fs = require('../../util/projectFs.cjs')

async function migrateEslintConfigs({ fromVersion }) {
  for (const file of [
    ...(await glob(Path.join('**', '.eslintrc{,.json}'))),
    '.eslintrc.js',
  ]) {
    const exists = await fs.pathExists(file)
    if (exists) {
      await fs.remove(file)
      // eslint-disable-next-line no-console
      console.error('removed', file)
    }
  }
}

module.exports = migrateEslintConfigs

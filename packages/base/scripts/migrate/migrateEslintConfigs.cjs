const glob = require('@jcoreio/toolchain/util/glob.cjs')
const Path = require('path')
const JSON5 = require('json5')
const fs = require('../../util/projectFs.cjs')

async function migrateEslintConfigs() {
  for (const file of await glob(Path.join('**', '.eslintrc{,.json}'))) {
    const content = JSON5.parse(await fs.readFile(file, 'utf8'))
    if (content.extends) {
      delete content.extends
      await fs.writeFile(file, JSON5.stringify(content, null, 2), 'utf8')
    }
  }
  for (const file of [
    '.eslintrc.js',
    '.eslintrc.json',
    '.eslintrc.yaml',
    '.eslintrc.yml',
    '.eslintrc',
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

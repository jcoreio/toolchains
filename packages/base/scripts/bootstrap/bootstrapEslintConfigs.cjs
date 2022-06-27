const { promisify } = require('util')
const glob = require('glob')
const Path = require('path')
const JSON5 = require('json5')
const fs = require('../../util/projectFs.cjs')
const { projectDir } = require('../../util/findUps.cjs')

async function bootstrapEslintConfigs() {
  for (const file of await promisify(glob)(
    Path.join('**', '.eslintrc{,.json}'),
    { cwd: projectDir }
  )) {
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

module.exports = bootstrapEslintConfigs
